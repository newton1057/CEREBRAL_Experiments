// Dashboard Training
// Author: Eduardo Davila
// Date: 29/06/2024

// Importing Libraries
import { useState, useRef, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import Table from 'react-bootstrap/Table';
import Swal from 'sweetalert2';
import Lottie from "lottie-react";
import axios from 'axios';
import { Modal } from 'react-bootstrap';
import RangeSlider from 'react-bootstrap-range-slider';
import ReactEmojis from "@souhaildev/reactemojis";

// Importing Lottie Files
import AnimationLoading from '../../assets/AnimationLoading.json';

// Importing Icons
import { Check, Prohibit } from "@phosphor-icons/react";

var data_default = [
  {
    "time": "",
    "risk": "",
    "arrival": "",
    "id": "A"
  },
  {
    "time": "",
    "risk": "",
    "arrival": "",
    "color": "#0B4A6F",
    "id": "B"
  },
  {
    "time": "",
    "risk": "",
    "arrival": "",
    "id": "C"
  },
  {
    "time": "",
    "risk": "",
    "arrival": "",
    "id": "D"
  }
]

export default function Dashboard_Training_Simulated_Experiment({ setStep, setStepLevel, updateSteps, setStepsCompleted }) {
  const [starExperiment, setStartExperiment] = useState(false); // State to start the experiment
  const [loading, setLoading] = useState(false); // State to show the loading animation
  const [highlightedRow, setHighlightedRow] = useState(null); // State to highlight the row selected
  const [dataGraph, setDataGraph] = useState(data_default); // State to store the data of the graph
  const [selected, setSelected] = useState(null); // State to store the selected row

  const [evualated, setEvualated] = useState([]); // State to store if the solution has been evaluated

  const [sliderDissatisfiedSatisfied, setSliderDissatisfiedSatisfied] = useState(50); // Slider of emotions Dissatisfied - Satisfied NOTE: 50 (Beetween) is the default value for the slider of emotions
  const [sliderBoredExcited, setSliderBoredExcited] = useState(50); // Slider of emotions Bored - Excited NOTE: 50 (Beetween) is the default value for the slider of emotions

  const [showModalEmotion, setShowModalEmotion] = useState(false); // Slider of emotions for each step
  const handleCloseModalEmotion = () => setShowModalEmotion(false); // Handle close modal of emotions

  const [solutionCheck, setSolutionCheck] = useState([]); // Array of solutions evaluated by the user with emotions

  const videoRef = useRef(null); // Reference to the video element to capture the screen
  const [isCapturing, setIsCapturing] = useState(false); // State to capture the screen 

  const [startSimulation, setStartSimulation] = useState(false);

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

        if (videoRef.current) {
          console.log('Setting video stream source');
          videoRef.current.srcObject = mediaStream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
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
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCapturing(false);
  };

  const send_simulation = async () => {
    console.log('Sending simulation to the backend ROS');
    console.log(dataGraph[highlightedRow]);
    const data = dataGraph[highlightedRow];
    setStartSimulation(true);
    try {
      const response = await axios.post('http://127.0.0.1:4000/API/InitSimulation', {
        idParetoReal: data.ids_pareto_real,
        numIndReal: data.nums_ind_real
      });
      console.log('Simulation sent to the backend ROS:', response.data);
      setStartSimulation(false);
      Swal.fire({
        icon: 'success',
        title: '¡Simulación terminada!',
        text: 'La simulación a terminado',
        confirmButtonColor: "#1A8754",
        confirmButtonText: "Siguiente",
        allowOutsideClick: false
      });

    } catch (error) {
      console.error('Error sending simulation:', error);
    }
  }

  useEffect(() => {
    if (dataGraph && starExperiment) {
      send_simulation();
    }

  }, [highlightedRow, dataGraph]);

  const getSolutions = async () => {
    console.log('Getting solutions from the backend');
    setLoading(true); // Show loading animation while fetching data

    try {
      const response = await axios.get('http://127.0.0.1:4000/API/Solutions_Experiment_Simulated'); // Fetch the solutions from the backend
      const solutions = response.data.solutions; // Get the solutions from the backend
      console.log('Solutions fetched from the backend:', solutions);
      setDataGraph(solutions); // Set the solutions fetched from the backend
      setStartExperiment(true); // Start the experiment
      setSelected(1); // Start with the first row selected
      setHighlightedRow(0); // Start with the first row highlighted
    } catch (error) {
      console.error('Error fetching solutions:', error);
    } finally {
      setLoading(false); // Hide loading animation
    }
  };

  const acceptSolutions = async () => {
    console.log('Running the evaluation of emotions for the solution');
    console.log('Selected row: ', highlightedRow);

    const selectedRow = dataGraph[highlightedRow]; // Select the data of the row that is being evaluated
    console.log('Data of the selected row: ', selectedRow);

    // Object with the new solution check
    const newSolutionCheck = {
      id: selectedRow.id,
      time: selectedRow.time,
      risk: selectedRow.risk,
      arrival: selectedRow.arrival,
      sliderDissatisfiedSatisfied,
      sliderBoredExcited
    };

    console.log('New solution check: ', newSolutionCheck);

    const updatedSolutionCheck = [...solutionCheck, newSolutionCheck]; // Add the new solution check to the array of solutions evaluated

    setSolutionCheck(updatedSolutionCheck); // Update the array of solutions evaluated

    setEvualated([...evualated, highlightedRow]); // Update the array of solutions evaluated

    if (highlightedRow === dataGraph.length - 1) {
      console.log('All solutions have been evaluated');
      setEvualated([]); // Reset the array of solutions evaluated
      setLoading(true); // Show loading animation

      try {
        // Enviar las soluciones evaluadas al backend
        await axios.post('http://127.0.0.1:4000/API/SaveSolutions_Experiment_Simulated', {
          email: 'newton1057@gmail.com', // Email of the user
          solutions: updatedSolutionCheck, // Send the solutions evaluated to the backend
          type: 'Test'
        });

        console.log('Solutions saved successfully from the backend');
        setSolutionCheck([]); // Reset the array of solutions evaluated
        getSolutions(); // Get new solutions from the backend
      } catch (error) {
        console.error('Error saving solutions:', error);
      }

      setLoading(false); // Hide loading animation
      Swal.fire({
        icon: 'success',
        title: '¡Soluciones guardadas!',
        text: 'Las soluciones han sido guardadas con éxito. ¿Deseas continuar con el experimento realizando más soluciones?',
        showCancelButton: true,
        cancelButtonColor: "#1A8754",
        confirmButtonColor: "#DC3545",
        cancelButtonText: "Sí",
        confirmButtonText: "No",
        allowOutsideClick: false
      }).then((result) => {
        if (result.isConfirmed) {
          console.log('Finalizar el experimento');
          stopCapture();


          axios.post('http://127.0.0.1:4000/API/UpdatePhase', {
            email: JSON.parse(sessionStorage.getItem('profile')).email,
            phase: 'Simulated_Experiment_Training',
            phase_completed: 'Simulated_Experiment_Assesment'
          }).then((response) => {
            console.log(response.data);
          }).catch((error) => {
            console.error(error);
          });
          updateSteps('Simulated_Experiment_Training');
          setStep('Simulated_Experiment_Assesment');
          setStepsCompleted('Simulated_Experiment_Assesment');

        } else {
          console.log('Continuar con el experimento');
        }
      }
      );
    }

    setHighlightedRow((prev) => (prev === null ? 0 : (prev + 1) % dataGraph.length)); // Update the highlighted row
    setSelected(selected + 1); // Update the selected row

    handleCloseModalEmotion(); // Close the modal of emotions

    // Reset the sliders of emotions
    setSliderBoredExcited(50);
    setSliderDissatisfiedSatisfied(50);
  };

  return (
    <>
      <h1 className='mb-0'>Entrenamiento - Experimento Tradicional</h1>
      <hr />
      <div className='d-flex align-items-center' style={{ height: "-webkit-fill-available" }}>
        <div className='w-50'>
          <Table bordered >
            <thead>
              <tr>
                <th className='text-center'>Tiempo</th>
                <th className='text-center'>Riesgo</th>
                <th className='text-center'>Llegada</th>
              </tr>
            </thead>
            <tbody>
              {dataGraph.map((row, index) => (
                <tr key={index} style={{ backgroundColor: highlightedRow === index ? '#D9FAEA' : evualated.includes(index) ? '#dedede' : 'white' }}>
                  <td className='text-center align-middle'>
                    {/*row.time*/}
                    {parseFloat(row.time.toFixed(4))}
                  </td>
                  <td className='text-center align-middle'>
                    {/*row.risk */}
                    {parseFloat(row.risk.toFixed(4))}
                  </td>
                  <td className='text-center align-middle'>
                    {/*row.arrival */}
                    {parseFloat(row.arrival.toFixed(4))}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <div className='w-100 d-flex justify-content-around p-3'>
            <Button
              className='d-flex align-items-center'
              variant='danger'
              onClick={() => (
                Swal.fire({
                  icon: 'warning',
                  title: 'Prueba no completada',
                  html: '¿Estás seguro de que deseas salir de la prueba? <br> Los datos no se guardarán.',
                  confirmButtonColor: "#d33",
                  confirmButtonText: "Salir"
                }).then((result) => {
                  if (result.isConfirmed) {
                    stopCapture(); // Stop the capture of the screen
                    setStepLevel('') // Return to the previous step
                  }
                }))
              }>
              <Prohibit className='me-2' weight="bold" />Cancelar
            </Button>

            {starExperiment ?
              <>
                <Button className='d-flex align-items-center' variant='success' 
                onClick={() => {
                  if (startSimulation){
                    Swal.fire({
                      icon: 'error',
                      title: '¡Simulación en proceso!',
                      text: 'La simulación no ha terminado',
                      confirmButtonColor: "#1A8754",
                      confirmButtonText: "Aceptar",
                      allowOutsideClick: false
                    });
                  } else {
                    setShowModalEmotion(true)
                  }
                  
                }
                  } >
                  <Check className='me-2' weight="bold" />Evaluar solución
                  </Button>
              </>
              :
              <>
                <Button
                  className='d-flex align-items-center'
                  variant='success'
                  onClick={() => {
                    getSolutions();
                    startCapture();
                  }}
                >
                  <Check className='me-2' weight="bold" />Iniciar
                </Button>
              </>
            }
          </div>
        </div>

        {/* DIV : CaptureScreen */}
        <div className='w-50 h-100 p-3 d-flex flex-column justify-content-center'>
          {/* Aquí puedes agregar más contenido si es necesario */}
          {starExperiment && (
            <div>
              {
                /*
                <button onClick={isCapturing ? stopCapture : startCapture}>
                {isCapturing ? 'Stop Capture' : 'Start Capture'}
              </button>
                */
              }
              <video ref={videoRef} style={{ width: '100%', border: '1px solid black' }} autoPlay></video>
            </div>
          )
          }
        </div>
      </div>


      {/* Animation of Loading */}
      {loading && (
        <div className='d-flex justify-content-center align-items-center' style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 9999 }}>
          <Lottie animationData={AnimationLoading} style={{ width: 200, height: 200 }} />
        </div>
      )}

      {/* Modal of Emotions */}
      <Modal show={showModalEmotion} size="lg" centered>
        <Modal.Header>
          <Modal.Title>Evaluar solución</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h4 className='text-center'>¿Qué emoción sentiste al ver el robot?</h4>
          <hr />
          <h5 className='text-center'>Insatisfecho - Satisfecho</h5>
          <div className='d-flex align-items-center justify-content-between'>
            <ReactEmojis emoji='😔' emojiStyle='2' />
            <div style={{ width: "65%" }}>
              <RangeSlider
                variant='warning'
                size='lg'
                step={16}
                max={96}
                tooltipPlacement='top'
                value={sliderDissatisfiedSatisfied}
                onChange={changeEvent => setSliderDissatisfiedSatisfied(changeEvent.target.value)}
                tooltipLabel={currentValue => {
                  if (currentValue === 25) {
                    return <ReactEmojis emoji='🙁' emojiStyle='2' style={{ with: "20px" }} />;
                  } else if (currentValue === 50) {
                    return <ReactEmojis emoji='😐' emojiStyle='2' style={{ with: "20px" }} />;
                  } else if (currentValue === 75) {
                    return <ReactEmojis emoji='🙂' emojiStyle='2' style={{ with: "20px" }} />;
                  }

                }}
                tooltipStyle={{ background: 'transparent', width: "100px", height: "100px" }}
              />
            </div>
            <ReactEmojis emoji='😄' emojiStyle='2' />
          </div>
          <hr />
          <h5 className='text-center'>Aburrido - Emocionado</h5>
          <div className='d-flex align-items-center justify-content-between'>
            <ReactEmojis emoji='😴' emojiStyle='2' />
            <div style={{ width: "65%" }}>
              <RangeSlider
                variant='warning'
                size='lg'
                step={16}
                max={96}
                tooltipPlacement='top'
                value={sliderBoredExcited}
                onChange={changeEvent => setSliderBoredExcited(changeEvent.target.value)}
                tooltipLabel={currentValue => {
                  if (currentValue === 25) {
                    return <ReactEmojis emoji='🙁' emojiStyle='2' style={{ with: "20px" }} />;
                  } else if (currentValue === 50) {
                    return <ReactEmojis emoji='😐' emojiStyle='2' style={{ with: "20px" }} />;
                  } else if (currentValue === 75) {
                    return <ReactEmojis emoji='😬' emojiStyle='2' style={{ with: "20px" }} />;
                  }

                }}
                tooltipStyle={{ background: 'transparent', width: "100px", height: "100px" }}
              />
            </div>

            <ReactEmojis emoji='😮' emojiStyle='2' />
          </div>
          <hr />
          <div className='d-flex justify-content-center'>
            <Button variant='success' onClick={acceptSolutions}><Check className='me-2' weight="bold" />Aceptar</Button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}