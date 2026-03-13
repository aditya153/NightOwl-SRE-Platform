import json
from agents import run_log_analysis

dummy_logs = """
2026-03-13 14:02:11 ERROR [main] org.springframework.boot.SpringApplication: Application run failed
org.springframework.beans.factory.BeanCreationException: Error creating bean with name 'userController': Injection of autowired dependencies failed; nested exception is org.springframework.beans.factory.BeanCreationException: Could not autowire field: private com.nightowl.service.UserService com.nightowl.controller.UserController.userService; nested exception is org.springframework.beans.factory.BeanCreationException: Error creating bean with name 'userServiceImpl': Injection of autowired dependencies failed; nested exception is java.lang.NullPointerException
    at org.springframework.beans.factory.annotation.AutowiredAnnotationBeanPostProcessor.postProcessPropertyValues(AutowiredAnnotationBeanPostProcessor.java:334)
    at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.populateBean(AbstractAutowireCapableBeanFactory.java:1214)
    at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.doCreateBean(AbstractAutowireCapableBeanFactory.java:543)
    ... 14 common frames omitted
Caused by: java.lang.NullPointerException: null
    at com.nightowl.service.UserServiceImpl.<init>(UserServiceImpl.java:42)
    ... 23 common frames omitted
"""

if __name__ == "__main__":
    print("Sending Dummy Log to CrewAI Log Analyst Agent...\n")
    
    result = run_log_analysis(dummy_logs)
    
    print("\n\n--- 🧠 ANALYST RESULT ---")
    print(json.dumps(result, indent=2))
