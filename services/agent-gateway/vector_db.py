from qdrant_client import QdrantClient
from qdrant_client.http.models import Distance, VectorParams, PointStruct
from langchain_community.embeddings import HuggingFaceEmbeddings
import uuid
import logging

logger = logging.getLogger(__name__)

# Initialize Qdrant Client (Connecting to local Docker container)
# We use host.docker.internal or localhost depending on where this runs. For local dev, localhost is fine.
qdrant_client = QdrantClient(host="localhost", port=6333)

COLLECTION_NAME = "incident_resolutions"

# We use local fast embeddings to avoid external API latency/keys
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

def init_vector_db():
    """Ensure the Qdrant collection exists."""
    collections = qdrant_client.get_collections().collections
    exists = any(c.name == COLLECTION_NAME for c in collections)
    
    if not exists:
        logger.info(f"Creating new Qdrant collection: {COLLECTION_NAME}")
        # all-MiniLM-L6-v2 outputs 384 dimensions
        qdrant_client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(size=384, distance=Distance.COSINE),
        )
    else:
        logger.info(f"Qdrant collection '{COLLECTION_NAME}' already exists.")

async def add_incident_resolution_to_memory(incident_id: int, title: str, reasoning: str, action: str):
    """
    Converts the incident's resolution into a vector and stores it in Qdrant.
    This acts as the 'Long-Term Memory' for the AI Agent (RAG).
    """
    try:
        # Create a rich text document combining what happened and how the AI solved it
        document_text = f"Incident Title: {title}\nAI Action Taken: {action}\nAI Reasoning: {reasoning}"
        
        # Generate the vector embedding using Gemini
        vector = embeddings.embed_query(document_text)
        
        # We need a unique String UUID for Qdrant points
        point_id = str(uuid.uuid4())
        
        # Save to Qdrant
        qdrant_client.upsert(
            collection_name=COLLECTION_NAME,
            points=[
                PointStruct(
                    id=point_id,
                    vector=vector,
                    payload={
                        "incident_id": incident_id,
                        "title": title,
                        "action": action,
                        "reasoning": reasoning
                    }
                )
            ]
        )
        logger.info(f"[MEMORY] Successfully embedded and saved Incident #{incident_id} to Vector DB.")
    except Exception as e:
        logger.error(f"[MEMORY] Failed to save incident to vector db: {e}")

def find_similar_past_incidents(query_text: str, limit: int = 3):
    """
    Searches Qdrant for similar past incidents based on the incoming alert text.
    """
    try:
        query_vector = embeddings.embed_query(query_text)
        
        search_result = qdrant_client.search(
            collection_name=COLLECTION_NAME,
            query_vector=query_vector,
            limit=limit
        )
        
        results = []
        for hit in search_result:
            results.append({
                "score": hit.score,
                "incident_id": hit.payload.get("incident_id"),
                "title": hit.payload.get("title"),
                "action": hit.payload.get("action"),
                "reasoning": hit.payload.get("reasoning")
            })
            
        return results
    except Exception as e:
        logger.error(f"[MEMORY] Similarity search failed: {e}")
        return []
