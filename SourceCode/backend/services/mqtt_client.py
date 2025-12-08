import os
import ssl
from typing import Optional

import paho.mqtt.client as mqtt

# MQTT config taken from ESP8266 firmware config.h to stay consistent.
MQTT_HOST = os.getenv("MQTT_HOST", "3ee91461277b4c8ea515775a3473e668.s1.eu.hivemq.cloud")
MQTT_PORT = int(os.getenv("MQTT_PORT", "8883"))
MQTT_USER = os.getenv("MQTT_USER", "smart_classroom")
MQTT_PASS = os.getenv("MQTT_PASS", "Smartclassroom15")
MQTT_CLIENT_ID = os.getenv("MQTT_CLIENT_ID", "smart-classroom-controller-server")

# Topics reused from firmware so commands are understood by the ESP8266.
TOPIC_BASE_DOOR_CMD = "classroom/door/"
TOPIC_BASE_LIGHT_CMD = "classroom/light/"

_client: Optional[mqtt.Client] = None


def _on_connect(client: mqtt.Client, _userdata, _flags, rc):
    if rc == 0:
        print("[MQTT] Connected to broker")
    else:
        print(f"[MQTT] Connect failed with code {rc}")


def start_mqtt():
    """Initialize a shared MQTT client and keep the loop running in background."""
    global _client
    if _client:
        return _client

    client = mqtt.Client(client_id=MQTT_CLIENT_ID, transport="tcp")
    client.username_pw_set(MQTT_USER, MQTT_PASS)
    # ESP8266 uses TLS insecure; mirror that here.
    client.tls_set(cert_reqs=ssl.CERT_NONE)
    client.tls_insecure_set(True)
    client.on_connect = _on_connect

    client.connect(MQTT_HOST, MQTT_PORT, keepalive=60)
    client.loop_start()

    _client = client
    return _client


def stop_mqtt():
    global _client
    if _client:
        _client.loop_stop()
        _client.disconnect()
        _client = None


def publish_command(topic: str, payload: str):
    """Publish a simple command; safe to call even if MQTT not ready."""
    if not _client:
        print("[MQTT] Client not started, skipping publish")
        return
    info = _client.publish(topic, payload)
    if info.rc != mqtt.MQTT_ERR_SUCCESS:
        print(f"[MQTT] Publish failed rc={info.rc} topic={topic}")


def build_door_topic(door_id: int) -> str:
    return f"{TOPIC_BASE_DOOR_CMD}{door_id}/cmd"


def build_light_topic(light_id: int) -> str:
    return f"{TOPIC_BASE_LIGHT_CMD}{light_id}/cmd"

