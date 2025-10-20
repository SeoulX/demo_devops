# 🧪 Testing Guide for CI/CD Pipeline

This guide shows you how to test your CI/CD pipeline and MongoDB integration.

## 🚀 Quick Test (All-in-One)

Run the comprehensive test script:

```bash
./test_pipeline.sh
```

This will test:
- ✅ Backend linting (flake8, black, isort)
- ✅ Backend unit tests (pytest)
- ✅ Frontend linting (ESLint)
- ✅ Frontend tests (Jest)
- ✅ Docker builds
- ✅ MongoDB connection

## 🔍 Individual Component Tests

### 1. Backend Testing

```bash
cd backend

# Setup environment
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pip install flake8 black isort pytest-cov

# Run linting
flake8 app --count --select=E9,F63,F7,F82 --show-source --statistics
flake8 app --count --exit-zero --max-complexity=10 --max-line-length=127 --statistics
black --check app
isort --check-only app

# Run tests
pytest app/test/ -v --cov=app --cov-report=term
```

### 2. Frontend Testing

```bash
cd frontend

# Install dependencies
npm ci --force

# Run linting
npm run lint

# Run type checking
npx tsc --noEmit

# Run tests
npm run test -- --coverage --watchAll=false
```

### 3. Docker Testing

```bash
# Test backend build
docker build -t test-backend ./backend

# Test frontend build
docker build -t test-frontend ./frontend

# Test with docker-compose
docker-compose up --build
```

### 4. MongoDB Testing

```bash
# Test MongoDB connection
python3 test_mongodb_connection.py

# Or test with docker-compose
docker-compose up mongodb
# In another terminal:
python3 test_mongodb_connection.py
```

## 🎯 GitHub Actions Testing

### Option 1: Push a Test Tag
```bash
# Create a test tag
git tag t1.0.0
git push origin t1.0.0

# This will trigger the test-and-lint workflow
```

### Option 2: Create a Test Branch
```bash
# Create a test branch
git checkout -b test-ci
git push origin test-ci

# This will trigger the test-and-lint workflow
```

### Option 3: Create a Pull Request
```bash
# Create a test branch
git checkout -b test-pr
# Make a small change
echo "# Test" >> README.md
git add README.md
git commit -m "Test PR"
git push origin test-pr

# Then create a PR on GitHub
```

## 🔧 Jenkins Testing

### Local Jenkins (if installed)
```bash
# Run Jenkins pipeline locally
jenkins-cli build test-pipeline
```

### Jenkinsfile Testing
The current Jenkinsfile is basic. You can enhance it with:

```groovy
pipeline {
    agent any
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        stage('Backend Test') {
            steps {
                sh '''
                    cd backend
                    python3 -m venv .venv
                    source .venv/bin/activate
                    pip install -r requirements.txt
                    pip install flake8 black isort pytest-cov
                    flake8 app --count --select=E9,F63,F7,F82 --show-source --statistics
                    black --check app
                    isort --check-only app
                    pytest app/test/ -v
                '''
            }
        }
        stage('Frontend Test') {
            steps {
                sh '''
                    cd frontend
                    npm ci --force
                    npm run lint
                    npx tsc --noEmit
                    npm run test -- --watchAll=false
                '''
            }
        }
        stage('Docker Build') {
            steps {
                sh '''
                    docker build -t test-backend ./backend
                    docker build -t test-frontend ./frontend
                '''
            }
        }
    }
}
```

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   ```bash
   # Check if MongoDB is running
   docker-compose up mongodb
   
   # Check connection string
   echo $MONGODB_URL
   ```

2. **Frontend Dependencies Issues**
   ```bash
   # Clear cache and reinstall
   cd frontend
   rm -rf node_modules package-lock.json
   npm install --force
   ```

3. **Backend Import Errors**
   ```bash
   # Check Python path
   cd backend
   export PYTHONPATH=$PWD:$PYTHONPATH
   python -c "import app.main"
   ```

4. **Docker Build Fails**
   ```bash
   # Check Dockerfile syntax
   docker build --no-cache -t test-backend ./backend
   ```

## 📊 Expected Results

### Successful Test Output
- ✅ All linting checks pass
- ✅ All unit tests pass (2 backend, 8 frontend)
- ✅ Docker builds complete successfully
- ✅ MongoDB connection established
- ✅ Coverage reports generated

### Coverage Targets
- Backend: >80% coverage
- Frontend: >70% coverage

## 🚀 Next Steps

1. **Run the test script**: `./test_pipeline.sh`
2. **Fix any issues** that come up
3. **Push a test tag**: `git tag t1.0.0 && git push origin t1.0.0`
4. **Check GitHub Actions** for the workflow results
5. **Monitor the pipeline** for any failures

## 📝 Notes

- The pipeline is configured to run on tags starting with "t*"
- MongoDB is configured for external connection by default
- All tests should pass before any deployment
- Coverage reports are uploaded to Codecov (if configured)
