import re
from typing import List

# Curated list of technical skills for matching
TECH_SKILLS = [
    # Programming Languages
    "Python", "JavaScript", "TypeScript", "Java", "C++", "C#", "C",
    "Go", "Rust", "Ruby", "PHP", "Swift", "Kotlin", "Scala", "R",
    "Dart", "Perl", "Lua", "Haskell", "Elixir", "Clojure", "MATLAB",

    # Frontend
    "React", "Angular", "Vue.js", "Vue", "Next.js", "Nuxt.js", "Svelte",
    "HTML", "CSS", "SASS", "LESS", "Tailwind CSS", "Tailwind", "Bootstrap",
    "jQuery", "Redux", "MobX", "Webpack", "Vite", "Gatsby",

    # Backend
    "Node.js", "Express", "Express.js", "FastAPI", "Django", "Flask",
    "Spring Boot", "Spring", "ASP.NET", "Rails", "Ruby on Rails",
    "Laravel", "NestJS", "Koa", "Gin", "Fiber",

    # Databases
    "PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite", "Oracle",
    "Cassandra", "DynamoDB", "Elasticsearch", "Neo4j", "CouchDB",
    "MariaDB", "SQL Server", "Firebase", "Supabase",

    # Cloud & DevOps
    "AWS", "Azure", "GCP", "Google Cloud", "Docker", "Kubernetes",
    "Terraform", "Ansible", "Jenkins", "GitHub Actions", "GitLab CI",
    "CircleCI", "Travis CI", "Nginx", "Apache", "Linux",

    # Data & ML
    "TensorFlow", "PyTorch", "Scikit-learn", "Pandas", "NumPy",
    "Keras", "OpenCV", "NLTK", "SpaCy", "Hugging Face",
    "Machine Learning", "Deep Learning", "NLP", "Computer Vision",
    "Data Science", "Data Engineering", "Apache Spark", "Hadoop",
    "Airflow", "Kafka", "RabbitMQ",

    # Tools & Platforms
    "Git", "GitHub", "GitLab", "Bitbucket", "Jira", "Confluence",
    "Figma", "Postman", "Swagger", "GraphQL", "REST API", "gRPC",
    "WebSocket", "OAuth", "JWT",

    # Mobile
    "React Native", "Flutter", "Android", "iOS", "Xamarin",
    "SwiftUI", "Jetpack Compose",

    # Other
    "Agile", "Scrum", "CI/CD", "Microservices", "Serverless",
    "API Design", "System Design", "Unit Testing", "Integration Testing",
    "Test Driven Development", "TDD", "Object Oriented Programming", "OOP",
    "Functional Programming", "Design Patterns", "Data Structures",
    "Algorithms", "Celery", "RabbitMQ", "WebSockets",
]


def extract_skills(text: str) -> List[str]:
    """Extract technical skills from resume text using dictionary matching."""
    found_skills = []
    text_lower = text.lower()

    for skill in TECH_SKILLS:
        # Use word boundary matching
        pattern = r'\b' + re.escape(skill.lower()) + r'\b'
        if re.search(pattern, text_lower):
            if skill not in found_skills:
                found_skills.append(skill)

    return sorted(found_skills)
