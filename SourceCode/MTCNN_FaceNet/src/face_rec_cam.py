from __future__ import absolute_import
from __future__ import division
from __future__ import print_function

import tensorflow.compat.v1 as tf
tf.disable_v2_behavior()
from imutils.video import VideoStream

import argparse
import facenet
import imutils
import os
import sys
import math
import pickle
import align.detect_face
import numpy as np
import cv2
import collections
from sklearn.svm import SVC
import time


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--path', help='Path of the video you want to test on.', default=0)
    parser.add_argument('--timeout', help='Auto stop after N seconds of inactivity', type=int, default=15)
    parser.add_argument('--max_frames', help='Maximum number of frames to process', type=int, default=1000)
    parser.add_argument('--confidence_threshold', help='Minimum confidence to display', type=float, default=0.6)
    args = parser.parse_args()

    MINSIZE = 20
    THRESHOLD = [0.6, 0.7, 0.7]
    FACTOR = 0.709
    IMAGE_SIZE = 182
    INPUT_IMAGE_SIZE = 160
    CLASSIFIER_PATH = 'Models/facemodel.pkl'
    VIDEO_PATH = args.path
    FACENET_MODEL_PATH = 'Models/20180402-114759/20180402-114759.pb'

    # Load The Custom Classifier
    with open(CLASSIFIER_PATH, 'rb') as file:
        model, class_names = pickle.load(file)
    print("Custom Classifier, Successfully loaded")

    with tf.Graph().as_default():

        # Cai dat GPU neu co
        gpu_options = tf.compat.v1.GPUOptions(per_process_gpu_memory_fraction=0.6)
        sess = tf.compat.v1.Session(config=tf.compat.v1.ConfigProto(gpu_options=gpu_options, log_device_placement=False))

        with sess.as_default():

            # Load the model
            print('Loading feature extraction model')
            facenet.load_model(FACENET_MODEL_PATH)

            # Get input and output tensors
            images_placeholder = tf.get_default_graph().get_tensor_by_name("input:0")
            embeddings = tf.get_default_graph().get_tensor_by_name("embeddings:0")
            phase_train_placeholder = tf.get_default_graph().get_tensor_by_name("phase_train:0")
            embedding_size = embeddings.get_shape()[1]

            pnet, rnet, onet = align.detect_face.create_mtcnn(sess, "src/align")

            people_detected = set()
            person_detected = collections.Counter()

            cap = VideoStream(src=0).start()
            
            # Variables for timeout and frame counting
            frame_count = 0
            last_face_time = time.time()
            no_face_detected = True
            
            print("Camera started. Press 'q' to quit.")
            if args.timeout > 0:
                print(f"Auto-stop after {args.timeout} seconds of no face detection")
            if args.max_frames > 0:
                print(f"Will process maximum {args.max_frames} frames")

            try:
                while True:

                    # RESET các biến mỗi frame - THÊM ĐOẠN NÀY
                    faces_found = 0
                    best_class_probabilities = np.array([0.0])  # Reset về 0
                    best_name = "Unknown"
                    name = "Unknown"

                    # Check frame limit
                    if args.max_frames > 0 and frame_count >= args.max_frames:
                        print(f"\nReached maximum frame limit: {args.max_frames}")
                        break
                    
                    # Check timeout
                    if args.timeout > 0 and not no_face_detected:
                        if time.time() - last_face_time > args.timeout:
                            print(f"\nNo face detected for {args.timeout} seconds. Stopping...")
                            break
                    
                    frame = cap.read()
                    
                    if frame is None:
                        print("Failed to grab frame")
                        break
                    
                    frame = imutils.resize(frame, width=600)
                    frame = cv2.flip(frame, 1)
                    
                    frame_count += 1

                    try:
                        bounding_boxes, _ = align.detect_face.detect_face(frame, MINSIZE, pnet, rnet, onet, THRESHOLD, FACTOR)
                        faces_found = bounding_boxes.shape[0]
                        
                        if faces_found > 0:
                            no_face_detected = False
                            last_face_time = time.time()
                        else:
                            no_face_detected = True
                        
                        if faces_found > 1:
                            cv2.putText(frame, "Only one face", (0, 100), cv2.FONT_HERSHEY_COMPLEX_SMALL,
                                        1, (255, 255, 255), thickness=1, lineType=2)
                        elif faces_found > 0:
                            det = bounding_boxes[:, 0:4]
                            bb = np.zeros((faces_found, 4), dtype=np.int32)
                            for i in range(faces_found):
                                bb[i][0] = det[i][0]
                                bb[i][1] = det[i][1]
                                bb[i][2] = det[i][2]
                                bb[i][3] = det[i][3]
                                
                                # Check if face is large enough (at least 25% of frame height)
                                if (bb[i][3]-bb[i][1])/frame.shape[0] > 0.25:
                                    cropped = frame[bb[i][1]:bb[i][3], bb[i][0]:bb[i][2], :]
                                    scaled = cv2.resize(cropped, (INPUT_IMAGE_SIZE, INPUT_IMAGE_SIZE),
                                                        interpolation=cv2.INTER_CUBIC)
                                    scaled = facenet.prewhiten(scaled)
                                    scaled_reshape = scaled.reshape(-1, INPUT_IMAGE_SIZE, INPUT_IMAGE_SIZE, 3)
                                    feed_dict = {images_placeholder: scaled_reshape, phase_train_placeholder: False}
                                    emb_array = sess.run(embeddings, feed_dict=feed_dict)

                                    predictions = model.predict_proba(emb_array)
                                    best_class_indices = np.argmax(predictions, axis=1)
                                    best_class_probabilities = predictions[
                                        np.arange(len(best_class_indices)), best_class_indices]
                                    best_name = class_names[best_class_indices[0]]
                                    
                                    # Only display if confidence is above threshold
                                    if best_class_probabilities[0] > args.confidence_threshold:
                                        cv2.rectangle(frame, (bb[i][0], bb[i][1]), (bb[i][2], bb[i][3]), (0, 255, 0), 2)
                                        text_x = bb[i][0]
                                        text_y = bb[i][3] + 20

                                        name = class_names[best_class_indices[0]]
                                        cv2.putText(frame, name, (text_x, text_y), cv2.FONT_HERSHEY_COMPLEX_SMALL,
                                                    1, (255, 255, 255), thickness=1, lineType=2)
                                        cv2.putText(frame, str(round(best_class_probabilities[0], 3)), (text_x, text_y + 17),
                                                    cv2.FONT_HERSHEY_COMPLEX_SMALL,
                                                    1, (255, 255, 255), thickness=1, lineType=2)
                                        person_detected[best_name] += 1
                                        print(f"Frame {frame_count}: Detected {name} with confidence {best_class_probabilities[0]:.3f}")
                                    else:
                                        # Draw red box for low confidence
                                        cv2.rectangle(frame, (bb[i][0], bb[i][1]), (bb[i][2], bb[i][3]), (0, 0, 255), 2)
                                        cv2.putText(frame, "Unknown", (bb[i][0], bb[i][3] + 20), 
                                                    cv2.FONT_HERSHEY_COMPLEX_SMALL, 1, (255, 255, 255), thickness=1, lineType=2)
                    
                    except Exception as e:
                        print(f"Error processing frame {frame_count}: {str(e)}")
                        pass

                    # Display frame count and status
                    status_text = f"Frame: {frame_count}"
                    if args.timeout > 0 and not no_face_detected:
                        time_since_face = int(time.time() - last_face_time)
                        status_text += f" | No face for: {time_since_face}s"
                    cv2.putText(frame, status_text, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 
                                0.7, (0, 255, 0), 2)
                    
                    # Kiểm tra điều kiện dừng sau khi nhận diện
                    if faces_found > 0 and best_class_probabilities[0] > args.confidence_threshold:
                        # Kiểm tra nếu confidence >= 0.6 (60%)
                        if best_class_probabilities[0] >= 0.6:
                            print(f"\n{'='*50}")
                            print(f"NHẬN DIỆN THÀNH CÔNG!")
                            print(f"Tên: {name}")
                            print(f"Độ tin cậy: {best_class_probabilities[0]*100:.2f}%")
                            print(f"{'='*50}\n")
                            
                            # Hiển thị thông báo trên frame
                            cv2.putText(frame, "THANH CONG!", (frame.shape[1]//2 - 100, frame.shape[0]//2), 
                                       cv2.FONT_HERSHEY_COMPLEX, 1.5, (0, 255, 0), 3)
                            cv2.imshow('Face Recognition', frame)
                            cv2.waitKey(3000)  # Hiển thị 3 giây
                            break  # Thoát vòng lặp
                        else:
                            print(f"\n{'='*50}")
                            print(f"NHẬN DIỆN THẤT BẠI!")
                            print(f"Độ tin cậy quá thấp: {best_class_probabilities[0]*100:.2f}% (< 60%)")
                            print(f"{'='*50}\n")
                            
                            # Hiển thị thông báo trên frame
                            cv2.putText(frame, "THAT BAI!", (frame.shape[1]//2 - 100, frame.shape[0]//2), 
                                       cv2.FONT_HERSHEY_COMPLEX, 1.5, (0, 0, 255), 3)
                            cv2.imshow('Face Recognition', frame)
                            cv2.waitKey(3000)  # Hiển thị 3 giây
                            break  # Thoát vòng lặp

                    cv2.imshow('Face Recognition', frame)
                    
                    # Check for 'q' key press
                    key = cv2.waitKey(1) & 0xFF
                    if key == ord('q'):
                        print("\nUser requested quit")
                        break
                    elif key == ord('s'):
                        # Save screenshot
                        filename = f"screenshot_{frame_count}.jpg"
                        cv2.imwrite(filename, frame)
                        print(f"Screenshot saved: {filename}")

            except KeyboardInterrupt:
                print("\nInterrupted by user")
            
            finally:
                # Clean up resources
                print("\nCleaning up...")
                print(f"Total frames processed: {frame_count}")
                print(f"Detection summary: {dict(person_detected)}")
                cap.stop()
                cv2.destroyAllWindows()
                sess.close()
                print("Camera stopped successfully")


if __name__ == '__main__':
    main()