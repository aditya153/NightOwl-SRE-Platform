import os
import json
import uuid
import logging
from qdrant_client import QdrantClient
from qdrant_client.http.models import Distance, VectorParams, PointStruct
from langchain_community.embeddings import HuggingFaceEmbeddings

logging.basicConfig(level=logging.INFO, format="%(asctime)s │ %(levelname)s │ %(message)s")
logger = logging.getLogger("runbook_ingester")

QDRANT_HOST = "localhost"
QDRANT_PORT = 6333
COLLECTION_NAME = "runbooks"
DATA_DIR = os.path.join(os.path.dirname(__file__), "data", "runbooks")

def init_collection(client: QdrantClient):
    collections = client.get_collections().collections
    if not any(c.name == COLLECTION_NAME for c in collections):
        logger.info(f"Creating Qdrant collection: {COLLECTION_NAME}")
        client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(size=384, distance=Distance.COSINE),
        )
    else:
        logger.info(f"Collection '{COLLECTION_NAME}' already exists.")

def ingest_runbooks():
    logger.info("Initializing embedding model...")
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    client = QdrantClient(host=QDRANT_HOST, port=QDRANT_PORT)
    
    init_collection(client)
    
    if not os.path.exists(DATA_DIR):
        logger.error(f"Data directory not found: {DATA_DIR}")
        return

    points = []
    for filename in os.listdir(DATA_DIR):
        if not filename.endswith(".json"):
            continue
            
        filepath = os.path.join(DATA_DIR, filename)
        with open(filepath, "r") as f:
            try:
                data = json.load(f)
            except json.JSONDecodeError:
                logger.error(f"Failed to parse JSON: {filename}")
                continue
                
        title = data.get("title", "Unknown Playbook")
        tags = ", ".join(data.get("tags", []))
        symptoms = "\n".join(data.get("symptoms", []))
        rca = data.get("root_cause_analysis", "")
        steps = "\n".join(data.get("resolution_steps", []))
        
        document_text = f"Title: {title}\nTags: {tags}\nSymptoms:\n{symptoms}\nRoot Cause: {rca}\nResolution Steps:\n{steps}"
        
        logger.info(f"Embedding playbook: {title}")
        vector = embeddings.embed_query(document_text)
        
        point_id = str(uuid.uuid5(uuid.NAMESPACE_URL, filename))
        points.append(
            PointStruct(
                id=point_id,
                vector=vector,
                payload={
                    "title": title,
                    "tags": data.get("tags", []),
                    "symptoms": data.get("symptoms", []),
                    "root_cause_analysis": rca,
                    "resolution_steps": data.get("resolution_steps", []),
                    "source_file": filename
                }
            )
        )
    
    if points:
        client.upsert(collection_name=COLLECTION_NAME, points=points)
        logger.info(f"Successfully ingested {len(points)} runbooks into Qdrant.")
    else:
        logger.info("No valid JSON runbooks found to ingest.")

if __name__ == "__main__":
    ingest_runbooks()
