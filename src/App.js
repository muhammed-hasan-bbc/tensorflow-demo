import "./App.css";
import 'react-image-crop/dist/ReactCrop.css';

import { useState, useEffect } from "react";
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import ReactCrop from "react-image-crop";

const blazeface = require('@tensorflow-models/blazeface');


function App() {
  const [imagePath, setImagePath] = useState();
  const [cropProps, setCropProps] = useState();

  const onImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      let selectedImage = event.target.files[0]
      setImagePath(URL.createObjectURL(selectedImage));
    }
  };

  useEffect(() => {
    if (imagePath) identifyFace()
  }, [imagePath])

  const identifyFace = async () => {
    console.log("Starting up model")
    const model = await blazeface.load();

    // Pass in an image or video to the model. The model returns an array of
    // bounding boxes, probabilities, and landmarks, one for each detected face.

    const returnTensors = false; // Pass in `true` to get tensors back, rather than values.
    
    console.log("Running the prediction model");
    const predictions = await model.estimateFaces(document.getElementById("hiddenImage"), returnTensors);

    if (predictions.length > 0) {
      console.log("Found faces");

      for (let i = 0; i < predictions.length; i++) {
        const start = predictions[i].topLeft;
        const end = predictions[i].bottomRight;
        const size = [end[0] - start[0], end[1] - start[1]];
  
        // Render a rectangle over each detected face.

        console.log(predictions[i])


        setCropProps({
          unit: 'px',
          x: start[0],
          y: start[1],
          width: Math.abs(end[0] - start[0]),
          height: Math.abs(end[1] - start[1])
        })
      }

    } else {
      console.log("No faces found");
    }
  }

  return (
    <div className="App">
      <h1>Test faces application - TensorFlow</h1>

      <div>
        {imagePath ? <>
          <div style={{display: "none"}}>
            <img id="hiddenImage" src={imagePath} alt="Hidden" />
          </div>
          <ReactCrop
            onChange={crop => {
              setCropProps(crop)
            }}
            keepSelection={true}
            src={imagePath} 
            crop={cropProps}/>
        </>: <></>}

      </div>

      <input
        type="file"
        accept="image/*"
        name="file"
        onChange={onImageChange}
      />
    </div>
  );
}

export default App;
