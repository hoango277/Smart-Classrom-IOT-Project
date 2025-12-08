import sys
from io import BytesIO
from pathlib import Path
from typing import Dict

import numpy as np
import tensorflow.compat.v1 as tf
from PIL import Image

# Disable TF2 behavior to stay compatible with the pretrained graph
tf.disable_v2_behavior()

# Add FaceNet source path
ROOT = Path(__file__).resolve().parents[2]  # project root
FACENET_SRC = ROOT / "MTCNN_FaceNet" / "src"
if str(FACENET_SRC) not in sys.path:
    sys.path.append(str(FACENET_SRC))

import facenet  # noqa: E402


class FaceRecognizer:
    def __init__(self):
        models_dir = ROOT / "MTCNN_FaceNet" / "Models"
        pb_path = models_dir / "20180402-114759" / "20180402-114759.pb"
        clf_path = models_dir / "facemodel.pkl"

        # Load classifier
        import pickle

        with open(clf_path, "rb") as f:
            self.model, self.class_names = pickle.load(f)

        # Load graph
        self.graph = tf.Graph()
        with self.graph.as_default():
            self.sess = tf.Session()
            with self.sess.as_default():
                facenet.load_model(str(pb_path))
                self.images_placeholder = tf.get_default_graph().get_tensor_by_name("input:0")
                self.embeddings = tf.get_default_graph().get_tensor_by_name("embeddings:0")
                self.phase_train_placeholder = tf.get_default_graph().get_tensor_by_name("phase_train:0")
                # embedding_size = self.embeddings.get_shape()[1]  # not used directly

    def _preprocess(self, image_bytes: bytes) -> np.ndarray:
        """Load bytes, convert to RGB, resize to 160x160, prewhiten, return shape (1,160,160,3)."""
        img = Image.open(BytesIO(image_bytes)).convert("RGB")
        img = img.resize((160, 160))
        img_np = np.asarray(img)
        img_np = facenet.prewhiten(img_np)
        return img_np.reshape(-1, 160, 160, 3)

    def recognize(self, image_bytes: bytes, threshold: float = 0.7) -> Dict:
        """
        Return dict: {recognized: bool, user: str, confidence: float}
        Default threshold 0.7 (per request).
        """
        input_data = self._preprocess(image_bytes)
        feed_dict = {
            self.images_placeholder: input_data,
            self.phase_train_placeholder: False,
        }
        with self.graph.as_default():
            with self.sess.as_default():
                emb_array = self.sess.run(self.embeddings, feed_dict=feed_dict)
        predictions = self.model.predict_proba(emb_array)
        best_class_indices = np.argmax(predictions, axis=1)
        best_class_probabilities = predictions[np.arange(len(best_class_indices)), best_class_indices]
        prob = float(best_class_probabilities[0])
        name = self.class_names[best_class_indices[0]]
        recognized = prob > threshold
        return {"recognized": recognized, "user": name if recognized else "Unknown", "confidence": prob}


_recognizer: FaceRecognizer | None = None


def get_recognizer() -> FaceRecognizer:
    global _recognizer
    if _recognizer is None:
        _recognizer = FaceRecognizer()
    return _recognizer

