import { Form } from "react-bootstrap";
import { useEffect, useState, useRef } from "react";
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Swal from 'sweetalert2';
import ToggleButton from 'react-bootstrap/ToggleButton';
import axios from "axios";
import Lottie from "lottie-react";
import AnimationLoading from '../assets/AnimationLoading.json';

// Importing Icons
import { Check, Prohibit, Broom } from "@phosphor-icons/react";

export default function Comparison_Between_Experiments({ setStep, updateSteps, setStepsCompleted }) {
  const [validated, setValidated] = useState(false);
  const [radioValue, setRadioValue] = useState('1');
  const [loading, setLoading] = useState(false);

  const videoRef1 = useRef(null); // Reference to the video element to capture the screen
  const [isCapturing, setIsCapturing] = useState(false); // State to capture the screen 

  const startCapture = async () => {
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

  const handleSubmit = async (event) => {
    const form = event.currentTarget;

    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    } else {
      event.preventDefault();
      event.stopPropagation();

      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());

      console.log(data);

      await axios.post('http://127.0.0.1:4000/API/SaveQuiz_Beetween_Experiments', {
        email: JSON.parse(sessionStorage.getItem('profile')).email,
        data: data,
      }).then((response) => {
        console.log(response);
      }).catch((error) => {
        console.log(error);
      });

      Swal.fire({
        icon: 'success',
        title: 'Cuestionario completado',
        text: 'Gracias por completar el cuestionario.',
        width: '50%',
        confirmButtonText: "OK",
        confirmButtonColor: "#198754",
        allowOutsideClick: false,
      }).then((result) => {
        setStep('Finish');
        updateSteps('Comparison_Between_Experiments');
        setStepsCompleted('Finish');
        stopCapture();
        axios.post('http://127.0.0.1:4000/API/UpdatePhase', {
          email: JSON.parse(sessionStorage.getItem('profile')).email,
          phase: 'Comparison_Between_Experiments',
          phase_completed: 'Finish'
        }).then((response) => {
          console.log(response);
        }
        ).catch((error) => {
          console.log(error);
        });
      });
    }
    setValidated(true);
  };

  const handleReset = () => {
    setValidated(false);
    setRadioValue('1');
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
    document.getElementById('comparisonForm').reset();
  };

  const videoRef = useRef(null);


  useEffect(() => {
    const fetchData = async () => {


      setLoading(true);

      try {
        const response = await axios.post('http://127.0.0.1:4000/API/GetVideo', {
          email: JSON.parse(sessionStorage.getItem('profile')).email,

        }, {
          responseType: 'blob' // Importante para recibir datos binarios
        });

        // Crear un objeto URL para el blob del video
        const videoBlob = new Blob([response.data], { type: 'video/webm' });
        const videoUrl = URL.createObjectURL(videoBlob);

        // Asignar la URL del video a la referencia
        videoRef.current.src = videoUrl;
        //videoRef.current.play(); // Reproducir el video
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Agregar un listener para la interacción del usuario
    const handleUserInteraction = () => {
      if (videoRef.current) {
        videoRef.current.play(); // Intentar reproducir el video después de la interacción
        startCapture();
        document.removeEventListener('click', handleUserInteraction);
      }
    };

    document.addEventListener('click', handleUserInteraction);

    return () => {
      document.removeEventListener('click', handleUserInteraction);
    };
  }, []);


  return (
    <>
      <div className='w-100 h-100 d-flex flex-column'>
        <h1>Comparación entre experimentos</h1>
        <hr />
        <div className="ps-5 pe-5">
          <Form id="comparisonForm" noValidate validated={validated} onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Form.Group>
                <FloatingLabel controlId="floatingSelect" label="El problema fue fácil de entender.*">
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
                <FloatingLabel controlId="floatingSelect" label="¿Cuál método fue más fácil de usar?*">
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
                <FloatingLabel controlId="floatingSelect" label="¿Cuál método te gustaría usar otra vez?*">
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
              {
                /*
                <button onClick={isCapturing ? stopCapture : startCapture}>
                {isCapturing ? 'Stop Capture' : 'Start Capture'}
              </button>
                */
              }

              <div className="mb-3 w-100 d-flex flex-row">
                <ToggleButton
                  className="w-50 p-4"
                  key='1'
                  type="radio"
                  variant={radioValue === '1' ? 'outline-dark' : 'outline-dark'}
                  name="radio"
                  value="1"
                  checked={radioValue === '1'}
                  onClick={(e) => {
                    setRadioValue('1');
                    if (videoRef.current) {
                      videoRef.current.currentTime = 0; // Reiniciar el tiempo del video
                      videoRef.current.play(); // Reproducir el video
                    }
                  }}
                >
                  <h6><b>Método de gráfica de líneas</b></h6>
                  <video className="w-100" ref={videoRef} autoPlay loop></video>
                </ToggleButton>
                <ToggleButton
                  key='2'
                  className="w-50 p-4"
                  type="radio"
                  variant={radioValue === '2' ? 'outline-dark' : 'outline-dark'}
                  name="radio"
                  value="2"
                  checked={radioValue === '2'}
                  onClick={(e) => {
                    setRadioValue('2');
                    console.log('Reset simulation');
                  }}
                >
                  <h6><b>Método de simulación</b></h6>
                  <video ref={videoRef1} style={{ width: '100%', border: '1px solid black' }} autoPlay></video>
                </ToggleButton>

              </div>
              <div className="mb-3 w-100 d-flex flex-row justify-content-around">
                <Form.Check
                  inline
                  required
                  label="Método de gráfica de líneas"
                  name="SolutionMethod"
                  type='radio'
                  value='GraphicLines'
                />
                <Form.Check
                  inline
                  required
                  label="Método de simulación"
                  name="SolutionMethod"
                  type='radio'
                  value='Simulation'
                />
              </div>
              <Row className="mb-3">
                <Form.Group controlId="validationCustom01">
                  <FloatingLabel controlId="floatingTextarea2" label="¿Por qué?">
                    <Form.Control
                      as="textarea"
                      name='question5'
                      placeholder="Leave a comment here"
                      style={{ height: '100px' }}
                    />
                  </FloatingLabel>
                </Form.Group>
              </Row>
            </div>

            <hr />
            <div className='d-flex justify-content-end gap-4 mb-5'>
              <Button
                className="d-flex align-items-center" variant="danger"
                onClick={handleReset}
              >
                <Broom className="me-2" weight="bold" />Limpiar cuestionario
              </Button>
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