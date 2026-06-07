"""Shared Nova (Amazon Bedrock) invocation helper — used by ALL services."""
import boto3
import json
import os

from backend.core.config import AWS_REGION, BEDROCK_MODEL_ID, MOCK_MODE

_MOCK_RESPONSE = json.dumps({
    "mock": True,
    "message": "MOCK_MODE is enabled. Set MOCK_MODE=false and add real AWS credentials."
})


def invoke_nova(system_prompt: str, user_message: str) -> str:
    """
    Invoke Amazon Nova Pro via Bedrock.
    All services call this function — never call boto3 directly.

    Returns raw string (Nova's text response).
    Falls back to a mock JSON string when MOCK_MODE=true.
    """
    if MOCK_MODE:
        return _MOCK_RESPONSE

    client = boto3.client(
        "bedrock-runtime",
        region_name=AWS_REGION,
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    )

    try:
        response = client.converse(
            modelId=BEDROCK_MODEL_ID,
            messages=[{"role": "user", "content": [{"text": user_message}]}],
            system=[{"text": system_prompt}],
            inferenceConfig={"maxTokens": 1500}
        )
        return response["output"]["message"]["content"][0]["text"]
    except Exception as e:
        raise RuntimeError(f"Nova invocation failed: {str(e)}")
