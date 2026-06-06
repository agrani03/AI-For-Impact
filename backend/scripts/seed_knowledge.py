import sys
from sentence_transformers import SentenceTransformer
from supabase import create_client
from backend.core.config import SUPABASE_URL, SUPABASE_SERVICE_KEY

KNOWLEDGE_BASE = [
  {"category": "Frontend", "content": "React, Vue, Angular, TypeScript, Next.js, Tailwind CSS, Redux, React Query, Web performance, Core Web Vitals, CSS animations, responsive design, accessibility (a11y)"},
  {"category": "Backend", "content": "Node.js, Express, FastAPI, Django, REST APIs, GraphQL, gRPC, authentication (JWT, OAuth), rate limiting, caching, database design, API versioning"},
  {"category": "Cloud/AWS", "content": "AWS EC2, S3, Lambda, RDS, DynamoDB, CloudFront, IAM, VPC, ECS, API Gateway, CloudWatch, Terraform, CDK, infrastructure as code, serverless"},
  {"category": "Python", "content": "Python 3.11+, FastAPI, Django, Flask, pandas, numpy, scikit-learn, asyncio, type hints, pytest, virtual environments, pip, poetry"},
  {"category": "System Design", "content": "distributed systems, microservices, event-driven architecture, message queues (Kafka, RabbitMQ), load balancing, CDN, caching strategies (Redis), database sharding, CAP theorem"},
  {"category": "AI/ML", "content": "machine learning, deep learning, PyTorch, TensorFlow, scikit-learn, LLMs, prompt engineering, RAG, vector databases, embeddings, fine-tuning, model deployment"},
  {"category": "DevOps", "content": "Docker, Kubernetes, CI/CD, GitHub Actions, Jenkins, ArgoCD, monitoring (Prometheus, Grafana), logging, Linux, bash scripting, nginx"},
  {"category": "Databases", "content": "PostgreSQL, MySQL, MongoDB, Redis, DynamoDB, Elasticsearch, SQL optimization, indexing, transactions, ORMs, database migrations"},
  {"category": "Mobile", "content": "React Native, Flutter, iOS (Swift), Android (Kotlin), mobile performance, push notifications, offline support, app store deployment"},
  {"category": "Security", "content": "OWASP top 10, SQL injection prevention, XSS prevention, CSRF, input validation, secrets management, encryption, HTTPS, penetration testing basics"},
  {"category": "Testing", "content": "Jest, Vitest, pytest, unit testing, integration testing, E2E testing (Playwright, Cypress), TDD, code coverage, mocking"},
  {"category": "TypeScript", "content": "TypeScript, type safety, interfaces, generics, union types, decorators, strict mode, tsconfig, type utilities, zod schema validation"},
  {"category": "Soft Skills", "content": "system design communication, code review, technical documentation, agile/scrum, cross-functional collaboration, mentoring, estimation, problem decomposition"},
  {"category": "Web3/Blockchain", "content": "Solidity, Ethereum, smart contracts, Web3.js, ethers.js, DeFi protocols, NFTs, IPFS, wallet integration, gas optimization"},
  {"category": "Data Engineering", "content": "Apache Spark, Airflow, dbt, data pipelines, ETL, data warehouses (Snowflake, BigQuery), streaming data, Kafka, data modeling"},
]

def seed_knowledge():
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        print("Error: SUPABASE_URL or SUPABASE_SERVICE_KEY is missing from environment/config.")
        sys.exit(1)
        
    print("Loading embedding model...")
    model = SentenceTransformer('all-MiniLM-L6-v2')
    
    print("Connecting to Supabase...")
    supabase_client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    print("Seeding knowledge base...")
    for item in KNOWLEDGE_BASE:
        embedding = model.encode(item["content"]).tolist()
        try:
            supabase_client.table("market_knowledge").insert({
                "content": item["content"],
                "category": item["category"],
                "embedding": embedding
            }).execute()
            print(f"Seeded: {item['category']}")
        except Exception as e:
            print(f"Failed to seed {item['category']}: {e}")

    print("Knowledge base seeded successfully!")

if __name__ == "__main__":
    seed_knowledge()
