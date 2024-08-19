// Dashboard Training
// Author: Eduardo Davila
// Date: 29/06/2024

// Importing Libraries
import { useState, useRef, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import Table from 'react-bootstrap/Table';
import Swal from 'sweetalert2';
import axios from 'axios';
import { Modal } from 'react-bootstrap';
import RangeSlider from 'react-bootstrap-range-slider';
import ReactEmojis from "@souhaildev/reactemojis";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

// Importing Icons
import { Check, Prohibit } from "@phosphor-icons/react";

var data_default = [
  {
    "time": "0.0",
    "risk": "0.0",
    "arrival": "0.0",
    "id": "A"
  },
  {
    "time": "0.0",
    "risk": "0.0",
    "arrival": "0.0",
    "color": "#0B4A6F",
    "id": "B"
  },
  {
    "time": "0.0",
    "risk": "0.0",
    "arrival": "0.0",
    "id": "C"
  },
  {
    "time": "0.0",
    "risk": "0.0",
    "arrival": "0.0",
    "id": "D"
  }
]

export default function Simulated_Experiment_Assesment({ setStep, updateSteps, setStepsCompleted }) {
  // States of the component
  const [starExperiment, setStartExperiment] = useState(false); // State to start the experiment
  const [loading, setLoading] = useState(false); // State to show the loading animation
  const [highlightedRow, setHighlightedRow] = useState(null); // State to highlight the row selected
  const [dataGraph, setDataGraph] = useState(data_default); // State to store the data of the graph
  const [selected, setSelected] = useState(null); // State to store the selected row

  const [sliderDissatisfiedSatisfied, setSliderDissatisfiedSatisfied] = useState(50); // Slider of emotions Dissatisfied - Satisfied NOTE: 50 (Beetween) is the default value for the slider of emotions
  const [sliderBoredExcited, setSliderBoredExcited] = useState(50); // Slider of emotions Bored - Excited NOTE: 50 (Beetween) is the default value for the slider of emotions

  const [showModalEmotion, setShowModalEmotion] = useState(false); // Slider of emotions for each step
  const handleCloseModalEmotion = () => setShowModalEmotion(false); // Handle close modal of emotions

  const [showModalSelectSolution, setShowModalSelectSolution] = useState(false); // Slider of emotions for each step
  const handleCloseModalSelectSolution = () => setShowModalSelectSolution(false); // Handle close modal of emotions

  const [solutionCheck, setSolutionCheck] = useState([]); // Array of solutions evaluated by the user with emotions

  const [evualated, setEvualated] = useState([]); // State to store if the solution has been evaluated

  const videoRef = useRef(null); // Reference to the video element to capture the screen
  const [isCapturing, setIsCapturing] = useState(false); // State to capture the screen 

  const [startSimulation, setStartSimulation] = useState(false); // State to start the simulation

  const videoRefCamera = useRef(null);
  const [hasPermission, setHasPermission] = useState(true);
  const [deviceId, setDeviceId] = useState(null);

  const [progress, setProgress] = useState(0); // State to store the progress of the experiment

  const [conditionButton, setConditionButton] = useState(false); // State to enable the button to evaluate the solution


  let mediaRecorder = null; // Variable normal para el MediaRecorder
  let recordedChunks = []; // Variable normal para los fragmentos grabados

  function generateIncrementalRandomNumbers() {
    let numbers = [];
    let min = 0;
    let max = 100;

    // Generar los primeros 9 números aleatorios en orden creciente
    for (let i = 0; i < 8; i++) {
      // Calcular el rango disponible para el siguiente número
      let range = (max - min) / (10 - i); // Distribuye el rango equitativamente
      let gap = Math.floor(Math.random() * range) + 1;
      let randomNumber = min + gap;

      numbers.push(randomNumber);

      // Actualiza el valor mínimo para el próximo número
      min = randomNumber + 1;
    }

    // Añadir el 100 como el último número
    numbers.push(100);

    return numbers;
  }

  // Inicia la grabación
  const startRecording = () => {
    if (videoRefCamera.current && videoRefCamera.current.srcObject) {
      const stream = videoRefCamera.current.srcObject;
      mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });

      mediaRecorder.ondataavailable = (event) => {
        console.log('Chunk received:', event.data.size);
        if (event.data.size > 0) {
          recordedChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log('Recording stopped. Recorded chunks:', recordedChunks.length);
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        console.log('Blob size:', blob.size);

        if (blob.size > 0) {
          const formData = new FormData();
          formData.append('video', blob, 'recording.webm');
          formData.append('email', JSON.parse(sessionStorage.getItem('profile')).email);
          formData.append('experiment', 'Simulated_Experiment_Assesment' + highlightedRow);

          try {
            const response = await axios.post('http://127.0.0.1:4000/API/SaveVideo', formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            });
            console.log('Response:', response.data);
          } catch (error) {
            console.error('Error uploading video:', error);
          }
        } else {
          console.error('Blob is empty.');
        }
      };

      mediaRecorder.start();
    } else {
      console.error('Video stream not available.');
    }
  };

  // Detiene la grabación
  const stopRecording = () => {
    if (mediaRecorder) {
      console.log('Stopping recording...');
      mediaRecorder.stop();
      mediaRecorder = null; // Opcionalmente, reinicia la variable a null
    } else {
      console.error('No media recorder found.');
    }
  };

  useEffect(() => {
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



  const send_simulation = async () => {
    const data = dataGraph[highlightedRow]; // Select the data of the row that is being evaluated
    console.log('Sending simulation to the backend ROS', data);
    setStartSimulation(true); // Start the simulation
    startRecording(); // Start the recording of the screen
    try {
      const response = await axios.post('http://127.0.0.1:4000/API/InitSimulation', {
        idParetoReal: data.ids_pareto_real, // Pareto real ID
        numIndReal: data.nums_ind_real // Pareto real number
      });
      console.log('Result simulation:', response.data);
      console.log('Simulation finished successfully');

      setStartSimulation(false); // Stop the simulation

      stopRecording(); // Stop the recording of the screen

      Swal.fire({
        icon: 'success',
        title: '¡Simulación terminada!',
        text: 'La simulación a terminado.',
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
      //send_simulation();
    }
  }, [highlightedRow, dataGraph]); // Dependency of the highlighted row and the data of the graph

  const getSolutions = async () => {
    console.log('Getting solutions from the backend');
    setLoading(true); // Show loading animation while fetching data

    try {
      const response = await axios.get('http://127.0.0.1:4000/API/Solutions_Experiment_Simulated'); // Fetch the solutions from the backend
      console.log('Solutions fetched from the backend:', response.data);
      const solutions = response.data.solutions; // Get the solutions from the backend
      console.log('Solutions fetched from the backend:', solutions);

      let incrementalNumbers = generateIncrementalRandomNumbers(); // Get the incremental numbers to update the progress bar
      let progressIndex = 0; // Index to iterate over the incremental numbers

      const interval = setInterval(() => {
        if (progressIndex < incrementalNumbers.length) {
          let progressValue = incrementalNumbers[progressIndex]; // Get the value of the progress bar
          setProgress(progressValue); // Update the progress bar
          progressIndex++; // Increment the index
        }

        // Stop the interval when the progress bar is complete
        if (progressIndex >= incrementalNumbers.length) {
          clearInterval(interval);
        }
      }, 1000);

      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait for 10 seconds before proceeding
      setProgress(0);

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
    setConditionButton(false);
    const selectedRow = dataGraph[highlightedRow]; // Select the data of the row that is being evaluated
    console.log('Data of the selected row: ', selectedRow);

    // Object with the new solution check
    const newSolutionCheck = {
      id: selectedRow.id,
      time: selectedRow.time,
      risk: selectedRow.risk,
      arrival: selectedRow.arrival,
      sliderDissatisfiedSatisfied,
      sliderBoredExcited,
      id_pareto: selectedRow.id_pareto,
      num_ind: selectedRow.num_ind,
      id_pareto_real: selectedRow.ids_pareto_real,
      num_ind_real: selectedRow.nums_ind_real,
      emotion_value: sliderDissatisfiedSatisfied,
    };

    console.log('New solution check: ', newSolutionCheck);
    const updatedSolutionCheck = [...solutionCheck, newSolutionCheck]; // Add the new solution check to the array of solutions evaluated

    setSolutionCheck(updatedSolutionCheck); // Update the array of solutions evaluated
    setEvualated([...evualated, highlightedRow]); // Update the array of solutions evaluated

    if (highlightedRow === dataGraph.length - 1) {
      console.log('All solutions have been evaluated');
      setLoading(true); // Show loading animation
      setEvualated([]); // Reset the array of solutions evaluated

      try {
        // Enviar las soluciones evaluadas al backend
        const response = await axios.post('http://127.0.0.1:4000/API/SaveSolutions_Experiment_Simulated', {
          email: JSON.parse(sessionStorage.getItem('profile')).email, // User email
          solutions: updatedSolutionCheck, // Send the solutions evaluated to the backend
          type: 'Real'
        });

        console.log('Solutions saved successfully from the backend');
        console.log('Response:', response.data);

        let incrementalNumbers = generateIncrementalRandomNumbers(); // Get the incremental numbers to update the progress bar
        let progressIndex = 0; // Index to iterate over the incremental numbers

        const interval = setInterval(() => {
          if (progressIndex < incrementalNumbers.length) {
            let progressValue = incrementalNumbers[progressIndex]; // Get the value of the progress bar
            setProgress(progressValue); // Update the progress bar
            progressIndex++; // Increment the index
          }

          // Stop the interval when the progress bar is complete
          if (progressIndex >= incrementalNumbers.length) {
            clearInterval(interval);
          }
        }, 1000);

        await new Promise(resolve => setTimeout(resolve, 10000)); // Wait for 10 seconds before proceeding
        setProgress(0);



        setSolutionCheck([]); // Reset the array of solutions evaluated

        const solutions = response.data.solutions; // Get the solutions from the backend
        console.log('Solutions fetched from the backend:', solutions);

        setSelected(1); // Start with the first row selected
        setHighlightedRow(0); // Start with the first row highlighted
        setDataGraph(solutions); // Set the solutions fetched from the backend

        setStartExperiment(true); // Start the experiment
        //getSolutions(); // Get new solutions from the backend
      } catch (error) {
        console.error('Error saving solutions:', error);
      }

      setLoading(false); // Hide loading animation

      Swal.fire({
        icon: 'success',
        title: '¡Soluciones guardadas!',
        text: '¿Deseas continuar con el experimento realizando más soluciones?',
        showCancelButton: true,
        cancelButtonColor: "#1A8754",
        confirmButtonColor: "#DC3545",
        cancelButtonText: "Sí",
        confirmButtonText: "No",
        allowOutsideClick: false
      }).then((result) => {
        if (result.isConfirmed) {
          console.log('Finish the experiment simulation');
          Swal.fire({
            icon: 'success',
            title: '¡Experimento finalizado!',
            text: 'El experimento ha finalizado con éxito.',
            confirmButtonColor: "#1A8754",
            confirmButtonText: "Aceptar",
            allowOutsideClick: false
          }).then((result) => {
            setStep('Simulated_Experiment_Quiz');
            updateSteps('Simulated_Experiment_Assesment');
            setStepsCompleted('Simulated_Experiment_Quiz');
            axios.post('http://127.0.0.1:4000/API/UpdatePhase', {
              email: JSON.parse(sessionStorage.getItem('profile')).email,
              phase: 'Simulated_Experiment_Assesment',
              phase_completed: 'Simulated_Experiment_Quiz'
            }).then((response) => {
              console.log('Phase updated:', response.data);
            }).catch((error) => {
              console.error('Error updating phase:', error);
            });
          })
        } else {
          console.log('Continuar con el experimento');
          //setShowModalSelectSolution(true);
          /**
           * Swal.fire({
            icon: 'success',
            title: '¡Experimento finalizado!',
            text: 'El experimento ha finalizado con éxito. ¿Deseas regresar al menú principal?',
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Sí",
            cancelButtonText: "No",
            allowOutsideClick: false
          }).then((result) => {
            if (result.isConfirmed) {
              console.log('Regresar al menú principal');
              // Regresar al menú principal

            } else {
              console.log('Permanecer en la página');
              // Permanecer en la página
            }

          });
           */
        }
      }
      );
    } else {
      setHighlightedRow((prev) => (prev === null ? 0 : (prev + 1) % dataGraph.length)); // Update the highlighted row
      setSelected(selected + 1); // Update the selected row
    }

    handleCloseModalEmotion(); // Close the modal of emotions

    // Reset the sliders of emotions
    setSliderBoredExcited(50);
    setSliderDissatisfiedSatisfied(50);
  };

  return (
    <>
      <div className='w-100 h-100 d-flex flex-column justify-content-between'>
        <h1 className='mb-0'>Evaluación - Experimento Tradicional</h1>
        <hr />
        <div className='d-flex align-items-center' style={{ height: "-webkit-fill-available" }}>
          <div style={{ width: '30%' }}>
            <Table>
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
                      {parseFloat(row.time).toFixed(4)}
                    </td>
                    <td className='text-center align-middle'>
                      {parseFloat(row.risk).toFixed(4)}

                    </td>
                    <td className='text-center align-middle'>
                      {parseFloat(row.arrival).toFixed(4)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            <div className='w-100 d-flex justify-content-around p-3'>
              <Button className='d-flex align-items-center' variant='danger'
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
                <Button className='d-flex align-items-center' variant='success'
                  onClick={() => {
                    if (conditionButton) {
                      if (startSimulation) {
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
                    } else {
                      setConditionButton(true);
                      send_simulation();
                    }

                  }}
                >
                  <Check className='me-2' weight="bold" />Evaluar solución
                </Button>
                :
                <Button className='d-flex align-items-center' variant='success' onClick={() => getSolutions()}><Check className='me-2' weight="bold" />Iniciar</Button>
              }
            </div>
          </div>

          {/* DIV : CaptureScreen */}
          <div className='h-100 p-3 d-flex flex-column justify-content-center' style={{ width: '70%' }}>
            <video ref={videoRefCamera} style={{ width: '100%', border: '1px solid black' }} autoPlay />
          </div>
        </div>
      </div>

      {/* Animation of Loading */}
      {loading && (
        <div className='d-flex flex-column justify-content-center align-items-center' style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.8)', zIndex: 9999 }}>
          <div style={{ width: 200, height: 200 }}>
            <CircularProgressbar
              style={{ width: 200, height: 200 }}
              value={progress}
              text={`${progress}%`}
              styles={buildStyles({
                textSize: '20px',
                textColor: 'white',
                trailColor: '#d6d6d6',
                backgroundColor: '#3e98c7',
              })} />
          </div>
          {
            /**
             * <ProgressBar animated now={progress} label={<span style={{ fontWeight: 'bold', fontSize: '20px' }}>{`${progress}%`}</span>} style={{ width: '80%', marginTop: 20, marginBottom: 20, height: '50px' }} />
             */
          }
          <h3 className='mt-5' style={{ color: "white" }}>Cargando soluciones...</h3>
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
                step={25}
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
            <ReactEmojis emoji='😔' emojiStyle='2' />
            <div style={{ width: "65%" }}>
              <RangeSlider
                variant='warning'
                size='lg'
                step={25}
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

            <ReactEmojis emoji='😳' emojiStyle='2' />
          </div>
          <hr />
          <div className='d-flex justify-content-center'>
            <Button variant='success' onClick={acceptSolutions}><Check className='me-2' weight="bold" />Aceptar</Button>
          </div>
        </Modal.Body>
      </Modal>


      {/* Modal of select Solution */}
      <Modal show={showModalSelectSolution} size="lg" centered>
        <Modal.Header>
          <Modal.Title>Decidir solución</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h6 className='text-center mb-3'>Tienes que elegir una solución para finalizar</h6>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th className='text-center'>Tiempo</th>
                <th className='text-center'>Riesgo</th>
                <th className='text-center'>Llegada</th>
              </tr>
            </thead>
            <tbody>
              {dataGraph.map((row, index) => (
                <tr key={index} onClick={() => {
                  console.log('Row selected:', index);
                  console.log(dataGraph[index]);
                  Swal.fire({
                    icon: 'success',
                    title: '¡Solución seleccionada!',
                    text: 'La solución ha sido seleccionada con éxito. ¿Estas seguro?',
                    showCancelButton: true,
                    confirmButtonColor: "#3085d6",
                    cancelButtonColor: "#d33",
                    confirmButtonText: "Sí",
                    cancelButtonText: "No",
                    allowOutsideClick: false
                  }).then((result) => {
                    if (result.isConfirmed) {
                      console.log('Soluction selected:', index);
                      console.log(dataGraph[index]);
                      axios.post('http://127.0.0.1:4000/API/SaveSolutionEnd_Experiment_Simulated', {
                        email: 'newton1057@gmail.com',
                        solution: dataGraph[index]
                      }).then((response) => {
                        console.log('Solution saved:', response.data);
                        Swal.fire({

                          icon: 'success',
                          title: '¡Experimento finalizado!',
                          text: 'El experimento ha finalizado con éxito. Continua con el cuestionario.',
                          confirmButtonColor: "#3085d6",
                          confirmButtonText: "Avanzar",
                          allowOutsideClick: false
                        }).then((result) => {
                          if (result.isConfirmed) {
                            console.log('Regresar al menú principal');
                            setStep('Simulated_Experiment_Quiz');
                            updateSteps('Simulated_Experiment_Assesment');
                            setStepsCompleted('Simulated_Experiment_Quiz');

                            axios.post('http://127.0.0.1:4000/API/UpdatePhase', {
                              email: JSON.parse(sessionStorage.getItem('profile')).email,
                              phase: 'Simulated_Experiment_Assesment',
                              phase_completed: 'Simulated_Experiment_Quiz'
                            }).then((response) => {
                              console.log('Phase updated:', response.data);
                            }
                            ).catch((error) => {
                              console.error('Error updating phase:', error);
                            }
                            )
                              ;


                            // Regresar al menú principal

                          } else {
                            console.log('Permanecer en la página');
                            // Permanecer en la página
                          }

                        }
                        );
                      })
                        .catch((error) => {
                          console.error('Error saving solution:', error);
                        });
                    } else {
                      console.log('Finalizar el experimento');
                      //stopCapture();
                      setShowModalSelectSolution(true);
                    }
                  }
                  );
                }}>
                  <td className='text-center align-middle'>
                    {row.time}
                  </td>
                  <td className='text-center align-middle'>
                    {row.risk}
                  </td>
                  <td className='text-center align-middle'>
                    {row.arrival}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>


        </Modal.Body>
      </Modal>
    </>
  );
}