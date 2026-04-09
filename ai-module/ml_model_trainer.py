import os
import numpy as np
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report, confusion_matrix

NUM_SAMPLES = 5000
WINDOW_SIZE = 5

def generate_trajectory(exercise, is_good, length=30):
    # Generates a sequence of frames for a single rep
    # Angles: l_elbow, r_elbow, l_hip, r_hip, l_knee, r_knee
    frames = []
    
    # Defaults
    l_elbow = np.full(length, 160.0)
    r_elbow = np.full(length, 160.0)
    l_hip = np.full(length, 175.0)
    r_hip = np.full(length, 175.0)
    l_knee = np.full(length, 170.0)
    r_knee = np.full(length, 170.0)
    stages = np.zeros(length)
    
    t = np.linspace(0, 1, length) # Time progression 0 to 1
    # 0 to 0.5 is DOWN, 0.5 to 1.0 is UP
    stages[t <= 0.1] = 0 # NEUTRAL
    stages[(t > 0.1) & (t <= 0.5)] = 1 # DOWN
    stages[t > 0.5] = 2 # UP
    stages[t >= 0.9] = 0 # NEUTRAL
    
    # Trajectory shape: smooth cosine wave dipping at t=0.5
    curve = (np.cos(t * 2 * np.pi) + 1) / 2 # 1 at start/end, 0 at t=0.5
    
    if exercise == "PUSHUP":
        if is_good:
            depth = np.random.normal(85, 5)  # Good depth
            spine = np.random.normal(175, 4) # Good spine
            sym = np.random.normal(0, 3)
        else:
            # Maybe bad depth, maybe bad spine, maybe asymmetric
            mistakeType = np.random.choice(["depth", "spine", "sym"])
            if mistakeType == "depth":
                depth = np.random.normal(130, 10)
                spine = np.random.normal(175, 4)
                sym = np.random.normal(0, 3)
            elif mistakeType == "spine":
                depth = np.random.normal(85, 5)
                spine = np.random.normal(140, 10) # Sagging
                sym = np.random.normal(0, 3)
            else:
                depth = np.random.normal(85, 5)
                spine = np.random.normal(175, 4)
                sym = np.random.normal(30, 8) # High asymmetry
                
        # Base straight arms ~ 160
        l_elbow = 160 - (160 - depth) * (1 - curve)
        r_elbow = 160 - (160 - depth + sym) * (1 - curve)
        l_hip = spine - (10 * (1-curve)) # slight natural dip
        r_hip = spine - (10 * (1-curve))
        
    elif exercise == "SQUAT":
        if is_good:
            depth = np.random.normal(80, 8)
            hip_angle = np.random.normal(100, 10)
        else:
            depth = np.random.normal(130, 10) # Shallow
            hip_angle = np.random.normal(140, 10)
            
        l_knee = 175 - (175 - depth) * (1 - curve)
        r_knee = l_knee + np.random.normal(0, 3, length) # slight variance
        l_hip = 175 - (175 - hip_angle) * (1 - curve)
        r_hip = l_hip + np.random.normal(0, 3, length)
        
    elif exercise in ["CURL", "PULLUP"]:
        if is_good:
            depth = np.random.normal(45, 8) # Good curl/pull
            ext = np.random.normal(165, 5) # Good extension
        else:
            depth = np.random.normal(90, 15) # Half rep
            ext = np.random.normal(130, 10) # No full hang
            
        l_elbow = ext - (ext - depth) * (1 - curve)
        r_elbow = ext - (ext - depth) * (1 - curve) + np.random.normal(0, 4, length)

    # Add temporal noise
    l_elbow += np.random.normal(0, 1.5, length)
    r_elbow += np.random.normal(0, 1.5, length)
    l_hip += np.random.normal(0, 1.5, length)
    r_hip += np.random.normal(0, 1.5, length)
    l_knee += np.random.normal(0, 1.5, length)
    r_knee += np.random.normal(0, 1.5, length)
    
    # Clip angles
    l_elbow = np.clip(l_elbow, 10, 180)
    r_elbow = np.clip(r_elbow, 10, 180)
    l_hip = np.clip(l_hip, 10, 180)
    r_hip = np.clip(r_hip, 10, 180)
    l_knee = np.clip(l_knee, 10, 180)
    r_knee = np.clip(r_knee, 10, 180)

    for i in range(length):
        frames.append([
            l_elbow[i], r_elbow[i],
            l_hip[i], r_hip[i],
            l_knee[i], r_knee[i],
            stages[i]
        ])
    return frames

def extract_features(window_frames):
    # window_frames shape: (WINDOW_SIZE, 7)
    window_frames = np.array(window_frames)
    angles = window_frames[:, :6]
    stage = window_frames[-1, 6] # stage of latest frame
    
    # 1. Current Angles (mean over window for stability)
    mean_angles = np.mean(angles, axis=0) # 6 features
    
    # 2. Velocity (difference between first and last over time)
    # Using simple finite difference: (last - first)
    velocity = angles[-1] - angles[0] # 6 features
    
    # 3. Stability (variance over window)
    variance = np.var(angles, axis=0) # 6 features
    
    # 4. Symmetry (abs diff between L and R)
    sym_elbow = abs(mean_angles[0] - mean_angles[1])
    sym_hip = abs(mean_angles[2] - mean_angles[3])
    sym_knee = abs(mean_angles[4] - mean_angles[5])
    symmetry = np.array([sym_elbow, sym_hip, sym_knee]) # 3 features
    
    # Total = 6 + 6 + 6 + 3 + 1 = 22
    features = np.concatenate([mean_angles, velocity, variance, symmetry, [stage]])
    return features


def generate_dataset(exercise):
    X = []
    y = []
    
    print(f"Generating data for {exercise}...")
    
    for i in range(NUM_SAMPLES):
        # 50% good, 50% bad
        is_good = (i % 2 == 0)
        
        # Probabilistic labeling: instead of hard 1/0, we inject label noise 
        # around the boundaries by flipping some marginal cases, but here we 
        # use hard labels since it's classification, but we will make the RF return predict_proba
        
        traj = generate_trajectory(exercise, is_good, length=np.random.randint(20, 40))
        
        # We only extract features when we have enough frames
        for j in range(len(traj) - WINDOW_SIZE + 1):
            window = traj[j:j+WINDOW_SIZE]
            feats = extract_features(window)
            
            # Probabilistic flip: 2% chance to flip label to simulate human noise/edge cases
            label = 1 if is_good else 0
            if np.random.rand() < 0.02:
                label = 1 - label
                
            X.append(feats)
            y.append(label)
            
    return np.array(X), np.array(y)

def train_and_evaluate():
    models = {}
    exercises = ["PUSHUP", "SQUAT", "CURL", "PULLUP"]
    
    for ex in exercises:
        X, y = generate_dataset(ex)
        
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        print(f"\n--- {ex} ---")
        rf = RandomForestClassifier(n_estimators=50, max_depth=10, random_state=42, n_jobs=-1)
        
        scores = cross_val_score(rf, X_train, y_train, cv=3)
        print(f"CV Accuracy: {scores.mean():.4f} (+/- {scores.std():.4f})")
        
        rf.fit(X_train, y_train)
        preds = rf.predict(X_test)
        
        print("Classification Report:")
        print(classification_report(y_test, preds))
        print("Confusion Matrix:")
        print(confusion_matrix(y_test, preds))
        
        models[ex] = rf
        
    # Save the dictionary of models
    model_path = os.path.join(os.path.dirname(__file__), 'exercise_model.pkl')
    joblib.dump(models, model_path)
    print(f"\nModels saved to {model_path}")

if __name__ == "__main__":
    train_and_evaluate()
