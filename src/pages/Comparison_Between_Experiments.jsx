// Importing Dependencies
import { Form } from "react-bootstrap";
import { useEffect, useState, useRef } from "react";
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Swal from 'sweetalert2';
import ToggleButton from 'react-bootstrap/ToggleButton';
import axios from "axios";
import Lottie from "lottie-react";

// Importing Lottie Animation
import AnimationLoading from '../assets/AnimationLoading.json';

// Importing Icons
import { Check, Broom } from "@phosphor-icons/react";

import ImageDefaultGazebo from '../assets/Default_Img_Gazebo.png';

export default function Comparison_Between_Experiments({ setStep, updateSteps, setStepsCompleted }) {

  // State to validate the form
  const [validated, setValidated] = useState(false); // State to validate the form
  const [radioValue, setRadioValue] = useState(''); // State to manage the radio buttons
  const [loading, setLoading] = useState(false); // State to manage the loading animation

  // Create a reference for the videos
  const videoRefExperimentTraditional = useRef(null); // Create a reference for the video Experiment Traditional
  const videoRefExperimentSimulation = useRef(null); // Create a reference for the video Experiment Simulation

  const [paramsExperimentTraditional, setParamsExperimentTraditional] = useState(); // State to manage the parameters of the Experiment Traditional

  const [deviceId, setDeviceId] = useState(null);
  const videoRefCamera = useRef(null);

  const cancelTokenSource = useRef(null);

  useEffect( () => {
    console.log('Comparison_Between_Experiments');
     axios.post('http://127.0.0.1:4000/API/GetParametersExperimentTraditional', {
      email: JSON.parse(sessionStorage.getItem('profile')).email, // User email
    }).then((response) => {
      console.log(response);
      setParamsExperimentTraditional(response.data);
    }).catch((error) => {
      console.log(error);
    })

    // Function fetch the devices available
    const fetchDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices(); // Get the devices available
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        console.log('Video devices:', videoDevices);
        if (videoDevices.length > 0) {
          setDeviceId(videoDevices[1].deviceId); // Set the device ID IMPORTANT: Change the index to select the camera (1: Virtual Camera)
          console.log('Device ID:', videoDevices[1].deviceId);
          console.log('Virtual Camera initialized');
        } else {
          console.error('No video devices found');
        }
      } catch (error) {
        console.error('Error fetching devices', error);
      }
    };

    fetchDevices(); // Fetch the devices available
  }, []);

  useEffect(() => {
    // Function to start the video
    const startVideo = async () => {
      if (deviceId) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { deviceId: { exact: deviceId } }
          });

          // Check if the video element exists
          if (videoRefCamera.current) {
            videoRefCamera.current.srcObject = stream; // Set the video stream IMPORTANT: Virtual Camera
          }
        } catch (error) {
          console.error('Error accessing the camera', error);
          setHasPermission(false);
        }
      }
    };

    startVideo(); // Start the video
  }, [deviceId]); // Dependency of the device ID

  /**
   * 
   * const startCapture = async () => {
    try {
      // Options for the getDisplayMedia() method
      const displayMediaOptions = {
        video: {
          cursor: 'always', // Show the cursor
          displaySurface: 'window' // Capture the window
        },
        audio: false // Disable audio
      };

      const mediaPromise = navigator.mediaDevices.getDisplayMedia(displayMediaOptions); // Config options for navigator.mediaDevices.getDisplayMedia
      const apiPromise = fetch('http://127.0.0.1:4000/API/MoveMouse'); // Config options for the API request NOTE: To be able to move the mouse automatically

      try {
        const [mediaStream, apiResponse] = await Promise.all([mediaPromise, apiPromise]); // Await both promises

        // Manipulate the mediaStream and the API response
        console.log('MediaStream:', mediaStream);
        const data = await apiResponse.json();

        if (videoRef1.current) {
          console.log('Setting video stream source');
          videoRef1.current.srcObject = mediaStream;
          videoRef1.current.onloadedmetadata = () => {
            videoRef1.current.play();
          };
        };

        setIsCapturing(true); // Set the state to true
        console.log('Capture started');
      } catch (error) {
        console.error(error);
      }
    } catch (err) {
      console.error(err);
      setIsCapturing(false); // Set the state to false
    }
  };

  const stopCapture = () => {
    if (videoRef1.current && videoRef1.current.srcObject) {
      const tracks = videoRef1.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef1.current.srcObject = null;
    }
    setIsCapturing(false);
  };
   */

  // Function for the form submission
  const handleSubmit = async (event) => {
    const form = event.currentTarget; // Get the form

    // Check if the form is valid
    if (form.checkValidity() === false) {
      event.preventDefault(); // Prevent the default behavior
      event.stopPropagation(); // Stop the event propagation
    } else {
      event.preventDefault(); // Prevent the default behavior
      event.stopPropagation(); // Stop the event propagation

      const formData = new FormData(form); // Create a new FormData object
      const data = Object.fromEntries(formData.entries()); // Convert the FormData object to an object

      console.log(data);

      // Send the data to the server
      await axios.post('http://127.0.0.1:4000/API/SaveQuiz_Beetween_Experiments', {
        email: JSON.parse(sessionStorage.getItem('profile')).email, // User email
        data: data, // Quiz data
      }).then((response) => {
        console.log(response);
      }).catch((error) => {
        console.log(error);
      });

      Swal.fire({
        icon: 'success',
        title: 'Cuestionario completado',
        text: 'Gracias por completar el cuestionario.',
        width: '30%',
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#198754",
        allowOutsideClick: false,
      }).then(() => {
        setStep('Finish'); // Set the step to Finish
        updateSteps('Comparison_Between_Experiments'); // Update the steps
        setStepsCompleted('Finish'); // Set the steps completed to Finish

        // Update the phase completed
        axios.post('http://127.0.0.1:4000/API/UpdatePhase', {
          email: JSON.parse(sessionStorage.getItem('profile')).email, // User email
          phase: 'Comparison_Between_Experiments', // Phase name
          phase_completed: 'Finish' // Phase completed
        }).then((response) => {
          console.log(response);
        }).catch((error) => {
          console.log(error);
        });
      });
    }
    setValidated(true); // Set the validation state to true
  };

  const handleReset = () => {
    setValidated(false); // Reset the validation state
    setRadioValue(''); // Reset the radio buttons

    // Reset the videos
    if (videoRefExperimentTraditional.current && videoRefExperimentSimulation.current) {
      videoRefExperimentTraditional.current.currentTime = 0;
      videoRefExperimentSimulation.current.currentTime = 0;
    }

    document.getElementById('comparisonForm').reset(); // Reset the form
  };



  useEffect(() => {
    setLoading(true);

    // Function get the video for the Experiment Traditional
    const getVideoExperimentTraditional = async () => {
      //setLoading(true);
      try {
        const response = await axios.post('http://127.0.0.1:4000/API/GetVideo', {
          email: JSON.parse(sessionStorage.getItem('profile')).email, // User email
          type: 'Traditional' // Video type
        }, {
          responseType: 'blob' // IMPORTANT: Set the response type as a blob
        });

        // Create a URL for the video
        const videoBlob = new Blob([response.data], { type: 'video/webm' });
        const videoUrl = URL.createObjectURL(videoBlob);
        videoRefExperimentTraditional.current.src = videoUrl; // Set the video source
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false); // Set the loading state to false
      }
    };

    getVideoExperimentTraditional(); // Get the video for the Experiment Traditional

    setLoading(true);

    // Function get the video for the Experiment Simulation
    const getVideoExperimentSimulation = async () => {
      try {
        const response = await axios.post('http://127.0.0.1:4000/API/GetVideo', {
          email: JSON.parse(sessionStorage.getItem('profile')).email, // User email
          type: 'Simulation' // Video type
        }, {
          responseType: 'blob' // IMPORTANT: Set the response type as a blob
        });

        // Create a URL for the video
        const videoBlob = new Blob([response.data], { type: 'video/webm' });
        const videoUrl = URL.createObjectURL(videoBlob);
        videoRefExperimentSimulation.current.src = videoUrl; // Set the video source
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false); // Set the loading state to false
      }
    };

    getVideoExperimentSimulation(); // Get the video for the Experiment Simulation

    
  }, []);

  useEffect(() => {
    console.log("Se hizo click en toggle button");
    console.log(radioValue);
    if (radioValue === '1') {
      console.log("Se seleccionó el método de gráfica de líneas");

      // Cancelar cualquier solicitud anterior si la hay
      if (cancelTokenSource.current) {
        cancelTokenSource.current.cancel("Solicitud cancelada por el usuario");
      }

      // Crear un nuevo CancelToken
      cancelTokenSource.current = axios.CancelToken.source();

      // Pause the video of the Experiment Simulation
      if (videoRefExperimentSimulation.current) {
        videoRefExperimentSimulation.current.currentTime = 0;
        videoRefExperimentSimulation.current.pause();
      }

      // Play the video of the Experiment Traditional - Init Simulation
      console.log(paramsExperimentTraditional);
      axios.post('http://127.0.0.1:4000/API/InitSimulation', {
        idParetoReal: paramsExperimentTraditional.ids_pareto_real, // Pareto real ID
        numIndReal: paramsExperimentTraditional.nums_ind_real // Pareto real number
      }, {
        cancelToken: cancelTokenSource.current.token // Pasamos el token de cancelación
      }).then((response) => {
        console.log("Simulación iniciada:", response.data);
      }).catch((error) => {
        if (axios.isCancel(error)) {
          console.log("Solicitud cancelada:", error.message);
        } else {
          console.error("Error en la simulación:", error);
        }
      });

    } else if (radioValue === '2') {
      console.log("Se seleccionó el método de simulación");

      // Si se selecciona '2', cancelamos la solicitud anterior
      if (cancelTokenSource.current) {
        cancelTokenSource.current.cancel("Cambio de método: solicitud cancelada");
      }
    }
  }, [radioValue]);

  return (
    <>
      <div className='w-100 h-100 d-flex flex-column'>
        <h1>Comparación entre experimentos</h1>
        <hr />
        <div className="ps-5 pe-5">
          <Form id="comparisonForm" noValidate validated={validated} onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Form.Group>
                <FloatingLabel controlId="floatingSelect" label="¿El problema fue fácil de entender? *">
                  <Form.Select aria-label="Floating label select example" name='question1' required >
                    <option value="">Selecciona...</option>
                    <option value="Strongly Disagree">Totalmente en desacuerdo</option>
                    <option value="Disagree">En desacuerdo</option>
                    <option value="Neutral">Indiferente</option>
                    <option value="Agree">De acuerdo</option>
                    <option value="Strongly Agree">Totalmente de acuerdo</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    Introduce tu respuesta.
                  </Form.Control.Feedback>
                </FloatingLabel>
              </Form.Group>
            </Row>
            <Row className="mb-3">
              <Form.Group>
                <FloatingLabel controlId="floatingSelect" label="¿Cuál método fue más fácil de usar? *">
                  <Form.Select aria-label="Floating label select example" name='question2' required >
                    <option value="">Selecciona...</option>
                    <option value="Line Graph Method">Método de gráfica de líneas</option>
                    <option value="Simulation Method">Método de simulación</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    Introduce tu respuesta.
                  </Form.Control.Feedback>
                </FloatingLabel>
              </Form.Group>
            </Row>
            <Row className="mb-3">
              <Form.Group>
                <FloatingLabel controlId="floatingSelect" label="¿Cuál método te gustaría usar otra vez? *">
                  <Form.Select aria-label="Floating label select example" name='question3' required >
                    <option value="">Selecciona...</option>
                    <option value="Line Graph Method">Método de gráfica de líneas</option>
                    <option value="Simulation Method">Método de simulación</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    Introduce tu respuesta.
                  </Form.Control.Feedback>
                </FloatingLabel>
              </Form.Group>
            </Row>
            <hr />
            <div>
              <p>¿Cuál solución te gustó más?*</p>
              <div className="mb-3 w-100 d-flex flex-row gap-5">
                <ToggleButton className="w-50 p-3" key='1' type="radio" variant={radioValue === '1' ? 'outline-dark' : 'outline-dark'} name="radio" value="1" checked={radioValue === '1'}
                  onClick={(e) => {
                    setRadioValue('1');
                    if (videoRefExperimentTraditional.current) {
                      videoRefExperimentTraditional.current.currentTime = 0; // Reiniciar el tiempo del video
                      videoRefExperimentTraditional.current.play(); // Reproducir el video
                    }
                  }}
                >
                  <h6><b>Método de gráfica de líneas</b></h6>
                  <div style={{ position: 'relative', width: '100%' }}>
                    {radioValue !== '1' &&
                      <img
                        src={ImageDefaultGazebo}
                        alt="Gazebo"
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          zIndex: 2,
                          opacity: 1 // Puedes ajustar la opacidad si deseas
                        }}
                      />
                    }
                    <video
                      style={{ width: '100%', height: 'auto', zIndex: 1 }}
                      ref={videoRefCamera}
                      autoPlay
                      loop
                    ></video>
                  </div>

                </ToggleButton>
                <ToggleButton
                  key='2'
                  className="w-50 p-3"
                  type="radio"
                  variant={radioValue === '2' ? 'outline-dark' : 'outline-dark'}
                  name="radio"
                  value="2"
                  checked={radioValue === '2'}
                  onClick={(e) => {
                    setRadioValue('2');
                    if (videoRefExperimentSimulation.current) {
                      videoRefExperimentSimulation.current.currentTime = 0; // Reiniciar el tiempo del video
                      videoRefExperimentSimulation.current.play(); // Reproducir el video si está seleccionado
                    }
                  }}
                >
                  <h6><b>Método de simulación</b></h6>
                  <video className="w-100" ref={videoRefExperimentSimulation}></video>
                </ToggleButton>
              </div>
              <div className="mb-3 w-100 d-flex flex-row justify-content-around">
                <Form.Check inline required label="Método de gráfica de líneas" name="SolutionMethod" type='radio' value='GraphicLines' />
                <Form.Check inline required label="Método de simulación" name="SolutionMethod" type='radio' value='Simulation' />
              </div>
              <Row className="mb-3">
                <Form.Group controlId="validationCustom01">
                  <FloatingLabel controlId="floatingTextarea2" label="¿Por qué?">
                    <Form.Control as="textarea" name='question5' placeholder="" style={{ height: '100px' }} />
                  </FloatingLabel>
                </Form.Group>
              </Row>
            </div>
            <hr />
            <div className='d-flex justify-content-end gap-4 mb-5'>
              <Button className="d-flex align-items-center" variant="danger" onClick={handleReset}><Broom className="me-2" weight="bold" />Limpiar cuestionario</Button>
              <Button className="d-flex align-items-center" variant="success" type="submit"><Check className="me-2" weight="bold" />Listo</Button>
            </div>
          </Form>
        </div>
      </div>

      {loading && (
        <div className='d-flex justify-content-center align-items-center' style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 9999 }}>
          <Lottie animationData={AnimationLoading} style={{ width: 200, height: 200 }} />
        </div>
      )}
    </>
  );
}