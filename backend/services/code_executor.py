"""Code execution service — evaluates coding challenges."""
import json
import sys
import subprocess
import tempfile
import os
from typing import Optional
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/code", tags=["code"])

# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------

class CodeExecutionRequest(BaseModel):
    code: str
    language: str = "python"
    test_cases: list[dict] = []  # {"input": {...}, "expected": ...}


class CodeExecutionResult(BaseModel):
    passed_tests: int
    total_tests: int
    output: str
    error: Optional[str] = None
    score: int  # 0-100
    execution_time: float


# ---------------------------------------------------------------------------
# Predefined test cases
# ---------------------------------------------------------------------------

CHALLENGES = {
    "two_sum": {
        "title": "Two Sum",
        "description": "Find two numbers that add up to target",
        "test_cases": [
            {
                "input": {"nums": [2, 7, 11, 15], "target": 9},
                "expected": [0, 1]
            },
            {
                "input": {"nums": [3, 2, 4], "target": 6},
                "expected": [1, 2]
            },
            {
                "input": {"nums": [3, 3], "target": 6},
                "expected": [0, 1]
            }
        ]
    }
}

# ---------------------------------------------------------------------------
# Code execution
# ---------------------------------------------------------------------------

def execute_python_code(code: str, test_cases: list) -> CodeExecutionResult:
    """Execute Python code against test cases."""
    try:
        import time
        start = time.time()
        
        # Create temp file for execution
        with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
            f.write(code)
            temp_file = f.name
        
        try:
            passed = 0
            total = len(test_cases)
            outputs = []
            
            for test in test_cases:
                # Build execution script
                test_code = code + f"""
result = two_sum(**{json.dumps(test['input'])})
print(result)
"""
                # Execute
                result = subprocess.run(
                    [sys.executable, '-c', test_code],
                    capture_output=True,
                    text=True,
                    timeout=5
                )
                
                if result.returncode == 0:
                    output = result.stdout.strip()
                    outputs.append(output)
                    # Simple check: convert output to list and compare
                    try:
                        actual = eval(output)
                        if actual == test['expected']:
                            passed += 1
                    except:
                        pass
                else:
                    outputs.append(f"Error: {result.stderr}")
            
            elapsed = time.time() - start
            score = int((passed / total * 100) if total > 0 else 0)
            
            return CodeExecutionResult(
                passed_tests=passed,
                total_tests=total,
                output="\n".join(outputs),
                score=score,
                execution_time=elapsed
            )
        finally:
            os.unlink(temp_file)
            
    except Exception as e:
        return CodeExecutionResult(
            passed_tests=0,
            total_tests=len(test_cases),
            output="",
            error=str(e),
            score=0,
            execution_time=0
        )


# ---------------------------------------------------------------------------
# API endpoints
# ---------------------------------------------------------------------------

@router.post("/execute")
async def execute_code(req: CodeExecutionRequest) -> CodeExecutionResult:
    """Execute code and return score."""
    # Use predefined test cases for two_sum
    test_cases = CHALLENGES.get("two_sum", {}).get("test_cases", [])
    
    if req.language == "python":
        return execute_python_code(req.code, test_cases)
    else:
        return CodeExecutionResult(
            passed_tests=0,
            total_tests=0,
            output="",
            error="Only Python supported for now",
            score=0,
            execution_time=0
        )


@router.get("/challenges")
async def list_challenges():
    """Get available challenges."""
    return {
        "challenges": [
            {
                "id": "two_sum",
                "title": CHALLENGES["two_sum"]["title"],
                "description": CHALLENGES["two_sum"]["description"]
            }
        ]
    }
