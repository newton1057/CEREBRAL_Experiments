// Page: Assessment
// Author: Eduardo Dávila
// Date: 24/06/2024

// Importing Libraries
import { useState, useRef, useEffect } from "react";
import { Button } from "react-bootstrap";
import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';
import Lottie from "lottie-react";
import { ResponsiveParallelCoordinates } from '@nivo/parallel-coordinates';
import Swal from 'sweetalert2';
import axios from "axios";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

// Importing theme customizations for the graph Parallel Coordinates
import themeResposiveParallelCoordinates from '../../config/themeResponsiveParallelCoordinates.json';

// Importing Icons
import { Play, ArrowCounterClockwise, Check } from "@phosphor-icons/react";

// Data for the Parallel Coordinates Graph (Default and Updated)
var data_default = [
  {
    "time": "0.0000",
    "timeFormat": "0.0000",
    "risk": "0.0000",
    "riskFormat": "0.0000",
    "arrival": "0.0000",
    "arrivalFormat": "0.0000",
    "color": "#0B4A6F",
    "id": "A"
  },
  {
    "time": "0.0000",
    "timeFormat": "0.0000",
    "risk": "0.0000",
    "riskFormat": "0.0000",
    "arrival": "0.0000",
    "arrivalFormat": "0.0000",
    "color": "#0B4A6F",
    "id": "B"
  },
  {
    "time": "0.0000",
    "timeFormat": "0.0000",
    "risk": "0.0000",
    "riskFormat": "0.0000",
    "arrival": "0.0000",
    "arrivalFormat": "0.0000",
    "color": "#0B4A6F",
    "id": "C"
  },
  {
    "time": "0.0000",
    "timeFormat": "0.0000",
    "risk": "0.0000",
    "riskFormat": "0.0000",
    "arrival": "0.0000",
    "arrivalFormat": "0.0000",
    "color": "#0B4A6F",
    "id": "D"
  }
];

export default function Traditional_Experiment_Assessment({ setStep, updateSteps, setStepsCompleted }) {
  // States for the component
  const videoRef = useRef(null);
  const playbackVideoRef = useRef(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [startSimulation, setStartSimulation] = useState(false);
  const [valueStartTime, setValueStartTime] = useState(0);
  const [valueEndTime, setValueEndTime] = useState(1);
  const [valueStartRisk, setValueStartRisk] = useState(0);
  const [valueEndRisk, setValueEndRisk] = useState(1);
  const [valueStartArrival, setValueStartArrival] = useState(0);
  const [valueEndArrival, setValueEndArrival] = useState(1);

  const [progress, setProgress] = useState(0);

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

  useEffect(() => {
    return () => {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
      }
    };
  }, [mediaRecorder]);

  let recordingChunks = [];

  const startCapture = async () => {
    recordingChunks = [];
    try {
      // Options for the getDisplayMedia() method
      const displayMediaOptions = {
        video: {
          cursor: 'always',
          displaySurface: 'window'
        },
        audio: false
      };

      // Config options for navigator.mediaDevices.getDisplayMedia
      const mediaPromise = navigator.mediaDevices.getDisplayMedia(displayMediaOptions);

      // Config options for the API request
      const apiPromise = fetch('http://127.0.0.1:4000/API/MoveMouse');

      try {
        // Await both promises
        const [mediaStream, apiResponse] = await Promise.all([mediaPromise, apiPromise]);

        // Maneja la respuesta del mediaStream y la API aquí
        const data = await apiResponse.json();


        if (videoRef.current) {
          console.log('Setting video stream source');
          videoRef.current.srcObject = mediaStream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
          };
        }


        let chunks = [];
        const recorder = new MediaRecorder(mediaStream, { mimeType: 'video/webm' });

        recorder.ondataavailable = (event) => {
          console.log('Data available');
          console.log(event.data);
          if (event.data.size > 0) {
            recordingChunks.push(event.data);
          }
        };


        recorder.onstop = () => {
          console.log('Recording stopped');

          saveAndSendVideo(recordingChunks);
        };

        setMediaRecorder(recorder);
        setIsCapturing(true);
        recorder.start();

        console.log('Capture started');

        var Data_Simulation = {
          idParetoReal: dataGraph[highlighted].ids_pareto_real,
          numIndReal: dataGraph[highlighted].nums_ind_real
        }

        console.log(Data_Simulation);

        setStartSimulation(true);

        await axios.post("http://127.0.0.1:4000/API/InitSimulation", {
          idParetoReal: 'optimized-50',
          numIndReal: 10
        }).then((response) => {
          const data = response.data;
          console.log(data);
          setStartSimulation(false);
        })


      } catch (error) {
        console.error('Error:', error);
      }
    } catch (err) {
      console.error("Error: " + err);
      setIsCapturing(false);
    }
  };

  const stopCapture = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCapturing(false);
  };

  const saveAndSendVideo = async (chunks) => {
    if (chunks.length > 0) {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      sessionStorage.setItem('screenRecording', url);

      const formData = new FormData();
      formData.append('video', blob, 'recording.webm');
      formData.append('email', JSON.parse(sessionStorage.getItem('profile')).email);
      formData.append('experiment', 'Traditional_Experiment_Assessment');

      try {
        const response = await axios.post('http://127.0.0.1:4000/API/SaveVideo', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

      } catch (error) {
        console.error('Error uploading video:', error);
      }
    } else {
      console.log('No chunks to save');
    }
  };

  const playRecordedVideo = () => {
    const recordedVideoUrl = sessionStorage.getItem('screenRecording');
    if (recordedVideoUrl && playbackVideoRef.current) {
      playbackVideoRef.current.src = recordedVideoUrl;
      playbackVideoRef.current.play();
    }
  };

  useEffect(() => {
    // Clean up the video URL from session storage when the component unmounts
    return () => {
      const recordedVideoUrl = sessionStorage.getItem('screenRecording');
      if (recordedVideoUrl) {
        URL.revokeObjectURL(recordedVideoUrl);
        sessionStorage.removeItem('screenRecording');
      }
    };
  }, []);



  const [stepLevel, setStepLevel] = useState('');
  const [dataGraph, setDataGraph] = useState(data_default);

  const [loading, setLoading] = useState(false);
  const [starExperiment, setStartExperiment] = useState(false);
  const [selections, setSelections] = useState([null, null, null, null]);

  const [highlighted, setHighlighted] = useState(null);
  const [colors, setColors] = useState(data_default.map(row => row.color));

  const getSolutions = async () => {

    setLoading(true); // Activating the loading animation

    try {
      // Request to the API to get the solutions
      const response = await axios.post('http://127.0.0.1:4000/API/Solutions_Experiment_Traditional');
      const data = response.data.solutions; // Getting the data

      data.forEach((element) => {
        element.arrivalFormat = parseFloat(element.arrival.toFixed(4)); // Adding the arrival with 4 decimals
        element.riskFormat = parseFloat(element.risk.toFixed(4)); // Adding the risk with 4 decimals
        element.timeFormat = parseFloat(element.time.toFixed(4)); // Adding the time with 4 decimals
      });

      var valuesTime = []; // Array to store the time values
      var valuesRisk = []; // Array to store the risk values
      var valuesArrival = []; // Array to store the arrival values

      data.forEach((element) => {
        valuesTime.push(Number(element.time)); // Adding the time value to the array
        valuesRisk.push(Number(element.risk)); // Adding the risk value to the array
        valuesArrival.push(Number(element.arrival)); // Adding the arrival value to the array
      });



      let incrementalNumbers = generateIncrementalRandomNumbers(); // Obtener los números generados

      let progressIndex = 0; // Índice para recorrer los números

      const interval = setInterval(() => {
        if (progressIndex < incrementalNumbers.length) {
          let progressValue = incrementalNumbers[progressIndex]; // Tomar el siguiente valor en la lista
          setProgress(progressValue); // Actualizar el progreso con el valor actual

          progressIndex++; // Incrementar el índice
        }

        // Si se ha recorrido toda la lista de números, detener el intervalo
        if (progressIndex >= incrementalNumbers.length) {
          clearInterval(interval);
        }
      }, 1000);

      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait for 10 seconds before proceeding

      setProgress(0);

      setValueStartTime(Math.min(...valuesTime) - 0.005); // Setting the minimum value for the time axis
      setValueEndTime(Math.max(...valuesTime) + 0.005); // Setting the maximum value for the time axis

      setValueStartRisk(Math.min(...valuesRisk) - 0.005); // Setting the minimum value for the risk axis
      setValueEndRisk(Math.max(...valuesRisk) + 0.005); // Setting the maximum value for the risk axis

      setValueStartArrival(Math.min(...valuesArrival) - 0.005); // Setting the minimum value for the arrival axis
      setValueEndArrival(Math.max(...valuesArrival) + 0.005); // Setting the maximum value for the arrival axis

      setDataGraph(data); // Updating the data for the Parallel Coordinates Graph
      setLoading(false); // Deactivating the loading animation
      setStartExperiment(true); // Setting the state to start the experiment

    } catch (error) {
      console.log(error);
      setLoading(false); // Deactivating the loading animation in case of error
    }
  }


  const updateSolutions = async () => {
    const selected = selections.filter(selection => (selection !== null && selection !== '')); // Filtering the selected values

    // Validating that the user has selected an order of preference for each row
    if (selected.length !== 4) {
      Swal.fire({
        icon: 'error',
        title: 'Prueba no completada',
        html: 'Debe seleccionar un orden de preferencia para cada fila para poder actualizar las soluciones.',
        width: '30%',
        confirmButtonColor: "#dc3545",
        confirmButtonText: "Entiendo",
        allowOutsideClick: false
      });
    } else {
      var data = [...dataGraph]; // Copying the data
      var bestSolution = {}; // Variable to store the best solution

      for (let i = 0; i < selected.length; i++) {
        data[i].order = Number(selected[i]); // Updating the order of preference
        if (selected[i] === '1') { // If the order of preference is 1
          bestSolution = data[i]; // Updating the best solution
        }
      }

      setLoading(true); // Activating the loading animation

      try {
        // Request to the API to update the solutions
        const response = await axios.post('http://127.0.0.1:4000/API/Solutions_Experiment_Traditional', {
          email: JSON.parse(sessionStorage.getItem('profile')).email, // User email
          bestSolution: bestSolution, // Best solution
          orderSolutions: data, // Solutions with the order of preference
          storagePOS: 0 // Storage position (NOTE)
        });

        const updatedData = response.data.solutions; // Getting the data

        updatedData.forEach((element) => {
          element.arrivalFormat = parseFloat(element.arrival.toFixed(4)); // Adding the arrival with 4 decimals
          element.riskFormat = parseFloat(element.risk.toFixed(4)); // Adding the risk with 4 decimals
          element.timeFormat = parseFloat(element.time.toFixed(4)); // Adding the time with 4 decimals
        });

        var valuesTime = []; // Array to store the time values
        var valuesRisk = []; // Array to store the risk values
        var valuesArrival = []; // Array to store the arrival values

        updatedData.forEach((element) => {
          console.log(element); // Printing the data
          valuesTime.push(Number(element.time)); // Adding the time value to the array
          valuesRisk.push(Number(element.risk)); // Adding the risk value to the array
          valuesArrival.push(Number(element.arrival)); // Adding the arrival value to the array
        });

        let incrementalNumbers = generateIncrementalRandomNumbers(); // Obtener los números generados

        let progressIndex = 0; // Índice para recorrer los números

        const interval = setInterval(() => {
          if (progressIndex < incrementalNumbers.length) {
            let progressValue = incrementalNumbers[progressIndex]; // Tomar el siguiente valor en la lista
            setProgress(progressValue); // Actualizar el progreso con el valor actual

            progressIndex++; // Incrementar el índice
          }

          // Si se ha recorrido toda la lista de números, detener el intervalo
          if (progressIndex >= incrementalNumbers.length) {
            clearInterval(interval);
          }
        }, 1000);

        await new Promise(resolve => setTimeout(resolve, 10000)); // Wait for 10 seconds before proceeding

        setProgress(0);

        setValueStartTime(Math.min(...valuesTime) - 0.005); // Setting the minimum value for the time axis
        setValueEndTime(Math.max(...valuesTime) + 0.005); // Setting the maximum value for the time axis

        setValueStartRisk(Math.min(...valuesRisk) - 0.005); // Setting the minimum value for the risk axis
        setValueEndRisk(Math.max(...valuesRisk) + 0.005); // Setting the maximum value for the risk axis

        setValueStartArrival(Math.min(...valuesArrival) - 0.005); // Setting the minimum value for the arrival axis
        setValueEndArrival(Math.max(...valuesArrival) + 0.005); // Setting the maximum value for the arrival axis

        setDataGraph(updatedData); // Updating the data for the Parallel Coordinates Graph
        setSelections([null, null, null, null]); // Resetting the selections
        setColors(data_default.map(row => row.color)); // Resetting the colors
        setHighlighted(null); // Resetting the highlighted
      } catch (error) {
        console.log(error); // Printing the error
      } finally {
        setLoading(false); // Deactivating the loading animation
      }
    }
  }

  const handleSelectChange = (index, event) => {
    const newSelections = [...selections];
    newSelections[index] = event.target.value;
    setSelections(newSelections);
  }

  const renderSelectOptions = (currentValue) => {
    const options = [1, 2, 3, 4];
    return options
      .filter(option => !selections.includes(String(option)) || String(option) === currentValue)
      .map(option => <option key={option} value={option}>{`${option}°`}</option>);
  }

  // NOT USE : FUTURE IMPLEMENTATION
  const renderStepContent = (currentStep) => {
    switch (currentStep) {
      case '':
        return (
          <>
            <h1 className="mb-0">Evaluación - Experimento Tradicional</h1>
            <hr />
            <div className='d-flex align-items-center mt-5' style={{ height: "-webkit-fill-available" }}>
              <div style={{ width: '35%' }}>
                <Table hover>
                  <thead>
                    <tr>
                      <th className='text-center'>Tiempo</th>
                      <th className='text-center'>Riesgo</th>
                      <th className='text-center'>Llegada</th>
                      <th className='columnOrderPreference text-center'>Orden de preferencia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dataGraph.map((row, index) => (
                      starExperiment ? (
                        <tr
                          key={index}
                          onClick={() => {
                            if (highlighted !== index) {
                              // Primero restaura el color de la celda actualmente destacada si hay alguna
                              const newColors = [...colors];
                              if (highlighted !== null) {
                                newColors[highlighted] = data_default[highlighted].color;
                              }
                              // Luego cambia el color de la celda actual a '#13F2BD'
                              newColors[index] = '#13F2BD';
                              // Actualiza el estado
                              setColors(newColors);
                              setHighlighted(index);
                            } else {
                              // Restaura el color original de la celda actual
                              const newColors = [...colors];
                              newColors[index] = data_default[index].color;
                              // Actualiza el estado
                              setColors(newColors);
                              setHighlighted(null);
                            }
                          }}
                          style={{ backgroundColor: highlighted === index ? '#D9FAEA' : 'white' }}
                        >
                          <td className='text-center align-middle'>
                            {/*row.time*/}
                            {parseFloat(row.time).toFixed(4)}
                          </td>
                          <td className='text-center align-middle'>
                            {/*row.risk */}
                            {parseFloat(row.risk).toFixed(4)}
                          </td>
                          <td className='text-center align-middle'>
                            {/*row.arrival */}
                            {parseFloat(row.arrival).toFixed(4)}
                          </td>
                          <td className='align-middle columnOrderPreference'>
                            <Form.Select
                              aria-label="Default select example"
                              value={selections[index] || ''}
                              onChange={(e) => handleSelectChange(index, e)}
                            >
                              <option value="">Selecciona...</option>
                              {renderSelectOptions(selections[index])}
                            </Form.Select>
                          </td>
                        </tr>
                      ) : (
                        <tr key={index}>
                          <td className='text-center align-middle'>
                            {parseFloat(row.time).toFixed(4)}
                          </td>
                          <td className='text-center align-middle'>
                            {parseFloat(row.risk).toFixed(4)}
                          </td>
                          <td className='text-center align-middle'>
                            {parseFloat(row.arrival).toFixed(4)}
                          </td>
                          <td className='align-middle'>
                            <Form.Select
                              aria-label="Default select example"
                              value={selections[index] || ''}
                              onChange={(e) => handleSelectChange(index, e)}
                            >
                              <option value="">Selecciona...</option>
                              {renderSelectOptions(selections[index])}
                            </Form.Select>
                          </td>
                        </tr>
                      )
                    ))}
                  </tbody>
                </Table>
                <div className='w-100 d-flex justify-content-around p-1 pt-4'>
                  {starExperiment ?
                    <Button className="d-flex align-items-center" variant='success' onClick={() => {
                      if (highlighted !== null) {
                        Swal.fire({
                          icon: 'success',
                          title: 'Opción seleccionada',
                          html: '<b>Tiempo:</b> ' + parseFloat(dataGraph[highlighted].time).toFixed(4) + '<br><b>Riesgo:</b> ' + parseFloat(dataGraph[highlighted].risk).toFixed(4) + '<br><b>Llegada:</b> ' + parseFloat(dataGraph[highlighted].arrival).toFixed(4),
                          width: '30%',
                          confirmButtonColor: "#198754",
                          confirmButtonText: "Aceptar",
                          allowOutsideClick: false
                        }).then(() => {
                          console.log('Experimento finalizado');
                          console.log(dataGraph[highlighted]);

                          Swal.fire({
                            title: 'Experimento completado',
                            text: '¡Has completado el experimento tradicional exitosamente!',
                            icon: 'success',
                            confirmButtonColor: "#198754",
                            confirmButtonText: "Siguiente",
                            allowOutsideClick: false
                          }).then(async () => {

                            var data = [...dataGraph]; // Copying the data

                            await axios.post('http://127.0.0.1:4000/API/SaveSolution_Experiment_Traditional', {
                              email: JSON.parse(sessionStorage.getItem('profile')).email,
                              solution: dataGraph[highlighted],
                              solutions: data,
                              storagePOS: 0
                            }).then((response) => {
                              console.log('Solución guardada');
                              console.log(response.data);
                            }
                            ).catch((error) => {
                              console.log(error);
                            });

                            setStep('Traditional_Experiment_Quiz'); // Change to the next step 'Traditional_Experiment_Quiz'
                            updateSteps('Traditional_Experiment_Assessment'); // Update the steps in the database state
                            setStepsCompleted('Traditional_Experiment_Quiz');

                            await axios.post('http://127.0.0.1:4000/API/UpdatePhase', {
                              email: JSON.parse(sessionStorage.getItem('profile')).email,
                              phase: 'Traditional_Experiment_Assessment',
                              phase_completed: 'Traditional_Experiment_Quiz'
                            }).then((response) => {
                              console.log('Fase actualizada');
                              console.log(response.data);
                            }
                            ).catch((error) => {
                              console.log(error);
                            });
                          });
                        });
                        //setStepLevel('Step1');
                        //startCapture();
                      } else {
                        Swal.fire({
                          icon: 'error',
                          title: 'No has seleccionado ningúna solución',
                          html: 'Por favor selecciona una solución antes de continuar.',
                          width: '40%',
                          confirmButtonColor: "#dc3545",
                          confirmButtonText: "Entiendo",
                          allowOutsideClick: false
                        });
                      }
                    }
                    }>
                      <Check className='me-2' weight="bold" /> Elegir opción
                    </Button>
                    : null
                  }
                  {starExperiment ?
                    <>
                      <Button className="d-flex align-items-center" variant='success' onClick={updateSolutions}>
                        <ArrowCounterClockwise className="me-2" weight="bold" />Buscar más
                      </Button>
                    </>
                    :
                    <>
                      <Button className="d-flex align-items-center" variant='success' onClick={getSolutions}>
                        <Play className="me-2" weight="bold" />Iniciar
                      </Button>
                    </>
                  }
                </div>
              </div>

              <div className='h-100' style={{ width: '65%' }}>
                <ResponsiveParallelCoordinates
                  data={dataGraph}
                  variables={[
                    {
                      id: 'timeFormat',
                      label: 'Tiempo',
                      value: 'timeFormat',
                      min: valueStartTime,
                      max: valueEndTime,
                      ticksPosition: 'before',
                      legendPosition: 'start',
                      legendOffset: 20
                    },
                    {
                      id: 'riskFormat',
                      label: 'Riesgo',
                      value: 'riskFormat',
                      min: valueStartRisk,
                      max: valueEndRisk,
                      ticksPosition: 'before',
                      legendPosition: 'start',
                      legendOffset: 20
                    },
                    {
                      id: 'arrivalFormat',
                      label: 'Llegada',
                      value: 'arrivalFormat',
                      min: valueStartArrival,
                      max: valueEndArrival,
                      ticksPosition: 'before',
                      legendPosition: 'start',
                      legendOffset: 20,

                    }
                  ]}
                  margin={{ top: 20, right: 50, bottom: 20, left: 50 }}
                  lineWidth={4}
                  lineOpacity={1}
                  theme={themeResposiveParallelCoordinates}
                  colors={colors}
                />
              </div>
            </div>
            {loading && (
              <div className='d-flex flex-column justify-content-center align-items-center' style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.8)', zIndex: 9999 }}>
                <div style={{ width: 200, height: 200 }}>
                  <CircularProgressbar
                    style={{ width: 200, height: 200 }}
                    value={progress}
                    text={`${progress}%`}
                    styles={buildStyles({


                      // Text size
                      textSize: '20px',


                      // Can specify path transition in more detail, or remove it entirely
                      // pathTransition: 'none',

                      // Colors
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
          </>
        );

      case 'Step1':
        return (
          <>
            <h1 className="mb-0">Evaluación - Experimento Tradicional</h1>
            <hr />
            <div className='d-flex align-items-center mt-5' style={{ height: "-webkit-fill-available" }}>
              <div className='w-50 p-4'>
                <Table bordered>
                  <thead>
                    <tr>
                      <th className='text-center'>Tiempo</th>
                      <th className='text-center'>Riesgo</th>
                      <th className='text-center'>Llegada</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className='text-center align-middle'>
                        {/**dataGraph[highlighted].time */}

                        {parseFloat(dataGraph[highlighted].time.toFixed(4))}

                      </td>
                      <td className='text-center align-middle'>

                        {parseFloat(dataGraph[highlighted].risk.toFixed(4))}
                      </td>
                      <td className='text-center align-middle'>

                        {parseFloat(dataGraph[highlighted].arrival.toFixed(4))}
                      </td>
                    </tr>
                  </tbody>
                </Table>

                <div className='w-100 d-flex justify-content-around p-3'>
                  <Button
                    className="d-flex align-items-center"
                    variant="warning"
                    onClick={() => {
                      if (startSimulation) {
                        Swal.fire({
                          title: 'Simulación corriendo',
                          text: 'La simulación esta en proceso',
                          icon: 'error',
                          confirmButtonColor: "#198754",
                          confirmButtonText: "Aceptar",
                          allowOutsideClick: false
                        })
                      } else {
                        stopCapture();
                        setStepLevel('');
                      }

                    }}>
                    <ArrowCounterClockwise className="me-1" weight="bold" />Repetir experimento
                  </Button>
                  <Button
                    className='d-flex align-items-center'
                    variant="success"
                    onClick={() => {
                      if (startSimulation) {
                        Swal.fire({
                          title: 'Simulación corriendo',
                          text: 'La simulación esta en proceso',
                          icon: 'error',
                          confirmButtonColor: "#198754",
                          confirmButtonText: "Aceptar",
                          allowOutsideClick: false
                        })
                      } else {
                        stopCapture();
                        Swal.fire({
                          title: 'Experimento completado',
                          text: '¡Has completado el experimento exitosamente!',
                          icon: 'success',
                          confirmButtonColor: "#198754",
                          confirmButtonText: "Siguiente",
                          allowOutsideClick: false
                        }).then(async (result) => {
                          console.log('Experimento completado');
                          console.log(dataGraph[highlighted]);
                          await axios.post('http://127.0.0.1:4000/API/SaveSolution_Experiment_Traditional', {
                            email: JSON.parse(sessionStorage.getItem('profile')).email,
                            solution: dataGraph[highlighted]
                          }).then((response) => {
                            console.log(response.data);
                          }
                          ).catch((error) => {
                            console.log(error);
                          });

                          setStep('Traditional_Experiment_Quiz');
                          updateSteps('Traditional_Experiment_Assessment');
                          setStepsCompleted('Traditional_Experiment_Quiz');

                          await axios.post('http://127.0.0.1:4000/API/UpdatePhase', {
                            email: JSON.parse(sessionStorage.getItem('profile')).email,
                            phase: 'Traditional_Experiment_Assessment',
                            phase_completed: 'Traditional_Experiment_Quiz'

                          }).then((response) => {
                            console.log(response.data);
                          }
                          ).catch((error) => {
                            console.log(error);
                          });

                          stopCapture();
                        });
                      }

                      //setStepLevel('')
                    }}
                  >
                    <Check className="me-1" weight="bold" />Terminar experimento
                  </Button>
                </div>
              </div>
              <div className='w-50'>
                <p>Visualización de la solución:</p>
                {
                  /* 
                   <Button onClick={startCapture} disabled={isCapturing}>Iniciar</Button>
                <button onClick={isCapturing ? stopCapture : startCapture}>
                  {isCapturing ? 'Stop Capture' : 'Start Capture'}
                </button>
                  
                  */
                }
                <video ref={videoRef} style={{ width: '100%', border: '1px solid black' }} autoPlay></video>
              </div>
            </div>
          </>
        );
      default:
        return null;
    }
  }

  return (
    <div className='w-100 h-100 d-flex flex-column justify-content-between'>
      {/**
       * renderStepContent(stepLevel)
       */}
      <>
        <h1 className="mb-0">Evaluación - Experimento Tradicional</h1>
        <hr />
        <div className='d-flex align-items-center mt-5' style={{ height: "-webkit-fill-available" }}>
          <div style={{ width: '35%' }}>
            <Table hover>
              <thead>
                <tr>
                  <th className='text-center'>Tiempo</th>
                  <th className='text-center'>Riesgo</th>
                  <th className='text-center'>Llegada</th>
                  <th className='columnOrderPreference text-center'>Orden de preferencia</th>
                </tr>
              </thead>
              <tbody>
                {dataGraph.map((row, index) => (
                  starExperiment ? (
                    <tr
                      key={index}
                      onClick={() => {
                        if (highlighted !== index) {
                          // Primero restaura el color de la celda actualmente destacada si hay alguna
                          const newColors = [...colors];
                          if (highlighted !== null) {
                            newColors[highlighted] = data_default[highlighted].color;
                          }
                          // Luego cambia el color de la celda actual a '#13F2BD'
                          newColors[index] = '#13F2BD';
                          // Actualiza el estado
                          setColors(newColors);
                          setHighlighted(index);
                        } else {
                          // Restaura el color original de la celda actual
                          const newColors = [...colors];
                          newColors[index] = data_default[index].color;
                          // Actualiza el estado
                          setColors(newColors);
                          setHighlighted(null);
                        }
                      }}
                      style={{ backgroundColor: highlighted === index ? '#D9FAEA' : 'white' }}
                    >
                      <td className='text-center align-middle'>
                        {/*row.time*/}
                        {parseFloat(row.time).toFixed(4)}
                      </td>
                      <td className='text-center align-middle'>
                        {/*row.risk */}
                        {parseFloat(row.risk).toFixed(4)}
                      </td>
                      <td className='text-center align-middle'>
                        {/*row.arrival */}
                        {parseFloat(row.arrival).toFixed(4)}
                      </td>
                      <td className='align-middle columnOrderPreference'>
                        <Form.Select
                          aria-label="Default select example"
                          value={selections[index] || ''}
                          onChange={(e) => handleSelectChange(index, e)}
                        >
                          <option value="">Selecciona...</option>
                          {renderSelectOptions(selections[index])}
                        </Form.Select>
                      </td>
                    </tr>
                  ) : (
                    <tr key={index}>
                      <td className='text-center align-middle'>
                        {parseFloat(row.time).toFixed(4)}
                      </td>
                      <td className='text-center align-middle'>
                        {parseFloat(row.risk).toFixed(4)}
                      </td>
                      <td className='text-center align-middle'>
                        {parseFloat(row.arrival).toFixed(4)}
                      </td>
                      <td className='align-middle'>
                        <Form.Select
                          aria-label="Default select example"
                          value={selections[index] || ''}
                          onChange={(e) => handleSelectChange(index, e)}
                        >
                          <option value="">Selecciona...</option>
                          {renderSelectOptions(selections[index])}
                        </Form.Select>
                      </td>
                    </tr>
                  )
                ))}
              </tbody>
            </Table>
            <div className='w-100 d-flex justify-content-around p-1 pt-4'>
              {starExperiment ?
                <Button className="d-flex align-items-center" variant='success' onClick={() => {
                  if (highlighted !== null) {
                    Swal.fire({
                      icon: 'success',
                      title: 'Opción seleccionada',
                      html: '<b>Tiempo:</b> ' + parseFloat(dataGraph[highlighted].time).toFixed(4) + '<br><b>Riesgo:</b> ' + parseFloat(dataGraph[highlighted].risk).toFixed(4) + '<br><b>Llegada:</b> ' + parseFloat(dataGraph[highlighted].arrival).toFixed(4),
                      width: '30%',
                      confirmButtonColor: "#198754",
                      confirmButtonText: "Aceptar",
                      allowOutsideClick: false
                    }).then(() => {
                      console.log('Experimento finalizado');
                      console.log(dataGraph[highlighted]);

                      Swal.fire({
                        title: 'Experimento completado',
                        text: '¡Has completado el experimento tradicional exitosamente!',
                        icon: 'success',
                        confirmButtonColor: "#198754",
                        confirmButtonText: "Siguiente",
                        allowOutsideClick: false
                      }).then(async () => {

                        var data = [...dataGraph]; // Copying the data

                        await axios.post('http://127.0.0.1:4000/API/SaveSolution_Experiment_Traditional', {
                          email: JSON.parse(sessionStorage.getItem('profile')).email,
                          solution: dataGraph[highlighted],
                          solutions: data,
                          storagePOS: 0
                        }).then((response) => {
                          console.log('Solución guardada');
                          console.log(response.data);
                        }
                        ).catch((error) => {
                          console.log(error);
                        });

                        setStep('Traditional_Experiment_Quiz'); // Change to the next step 'Traditional_Experiment_Quiz'
                        updateSteps('Traditional_Experiment_Assessment'); // Update the steps in the database state
                        setStepsCompleted('Traditional_Experiment_Quiz');

                        await axios.post('http://127.0.0.1:4000/API/UpdatePhase', {
                          email: JSON.parse(sessionStorage.getItem('profile')).email,
                          phase: 'Traditional_Experiment_Assessment',
                          phase_completed: 'Traditional_Experiment_Quiz'
                        }).then((response) => {
                          console.log('Fase actualizada');
                          console.log(response.data);
                        }
                        ).catch((error) => {
                          console.log(error);
                        });
                      });
                    });
                    //setStepLevel('Step1');
                    //startCapture();
                  } else {
                    Swal.fire({
                      icon: 'error',
                      title: 'No has seleccionado ningúna solución',
                      html: 'Por favor selecciona una solución antes de continuar.',
                      width: '40%',
                      confirmButtonColor: "#dc3545",
                      confirmButtonText: "Entiendo",
                      allowOutsideClick: false
                    });
                  }
                }
                }>
                  <Check className='me-2' weight="bold" /> Elegir opción
                </Button>
                : null
              }
              {starExperiment ?
                <>
                  <Button className="d-flex align-items-center" variant='success' onClick={updateSolutions}>
                    <ArrowCounterClockwise className="me-2" weight="bold" />Buscar más
                  </Button>
                </>
                :
                <>
                  <Button className="d-flex align-items-center" variant='success' onClick={getSolutions}>
                    <Play className="me-2" weight="bold" />Iniciar
                  </Button>
                </>
              }
            </div>
          </div>

          <div className='h-100' style={{ width: '65%' }}>
            <ResponsiveParallelCoordinates
              data={dataGraph}
              variables={[
                {
                  id: 'timeFormat',
                  label: 'Tiempo',
                  value: 'timeFormat',
                  min: valueStartTime,
                  max: valueEndTime,
                  ticksPosition: 'before',
                  legendPosition: 'start',
                  legendOffset: 20
                },
                {
                  id: 'riskFormat',
                  label: 'Riesgo',
                  value: 'riskFormat',
                  min: valueStartRisk,
                  max: valueEndRisk,
                  ticksPosition: 'before',
                  legendPosition: 'start',
                  legendOffset: 20
                },
                {
                  id: 'arrivalFormat',
                  label: 'Llegada',
                  value: 'arrivalFormat',
                  min: valueStartArrival,
                  max: valueEndArrival,
                  ticksPosition: 'before',
                  legendPosition: 'start',
                  legendOffset: 20,

                }
              ]}
              margin={{ top: 20, right: 50, bottom: 20, left: 50 }}
              lineWidth={4}
              lineOpacity={1}
              theme={themeResposiveParallelCoordinates}
              colors={colors}
            />
          </div>
        </div>
        {loading && (
          <div className='d-flex flex-column justify-content-center align-items-center' style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.8)', zIndex: 9999 }}>
            <div style={{ width: 200, height: 200 }}>
              <CircularProgressbar
                style={{ width: 200, height: 200 }}
                value={progress}
                text={`${progress}%`}
                styles={buildStyles({


                  // Text size
                  textSize: '20px',


                  // Can specify path transition in more detail, or remove it entirely
                  // pathTransition: 'none',

                  // Colors
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
      </>
    </div>
  );
}