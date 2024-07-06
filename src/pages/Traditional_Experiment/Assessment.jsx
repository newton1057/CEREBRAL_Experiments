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
// Importing theme customizations for the graph Parallel Coordinates
import themeResposiveParallelCoordinates from '../../config/themeResponsiveParallelCoordinates.json';

// Importing Lottie Files
import AnimationLoading from '../../assets/AnimationLoading.json';

// Importing Icons
import { Prohibit, Play, ArrowCounterClockwise, Check } from "@phosphor-icons/react";

var data_default = [
  {
    "time": "",
    "risk": "",
    "arrival": "",
    "color": "#0B4A6F",
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
    "color": "#0B4A6F",
    "id": "C"
  },
  {
    "time": "",
    "risk": "",
    "arrival": "",
    "color": "#0B4A6F",
    "id": "D"
  }
]

var data = [
  {
    "time": 12.1,
    "risk": 2.5,
    "arrival": 0.74,
    "color": "#0B4A6F",
    "id": "A"
  },
  {
    "time": 10.5,
    "risk": 1.7,
    "arrival": 0.58,
    "color": "#0B4A6F",
    "id": "B"
  },
  {
    "time": 8.7,
    "risk": 2.8,
    "arrival": 0.55,
    "color": "#0B4A6F",
    "id": "C"
  },
  {
    "time": 14.1,
    "risk": 3.1,
    "arrival": 0.69,
    "color": "#0B4A6F",
    "id": "D"
  }
];

export default function Traditional_Experiment_Assessment({ setStep, updateSteps, setStepsCompleted }) {

  const videoRef = useRef(null);
  const playbackVideoRef = useRef(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);

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
    setLoading(true);
    await axios.get('http://127.0.0.1:4000/API/Solutions_Experiment_Traditional')
      .then((response) => {
        const data = response.data.solutions;
        console.log(data);
        setDataGraph(data);
        setLoading(false);
        setStartExperiment(true);
      })
      .catch((error) => {
        console.log(error);
      });

  }

  const updateSolutions = async () => {
    const selected = selections.filter(selection => selection !== null);
    console.log(selected);
    if (selected.length !== 4) {
      Swal.fire({
        icon: 'warning',
        title: 'Prueba no completada',
        html: 'Debe seleccionar un orden de preferencia para cada fila para poder actualizar las soluciones.',
        width: '50%',
        confirmButtonColor: "#d33",
        confirmButtonText: "OK"
      });
    } else {
      setLoading(true);
      await axios.get('http://127.0.0.1:4000/API/Solutions_Experiment_Traditional')
        .then((response) => {
          const data = response.data.solutions;
          setDataGraph(data);
          setSelections([null, null, null, null]);
          setColors(data_default.map(row => row.color));
          setHighlighted(null);
          setLoading(false);
        })
        .catch((error) => {
          console.log(error);
        });
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

  const renderStepContent = (currentStep) => {
    switch (currentStep) {
      case '':
        return (
          <>
            <h1 className="mb-0">Evaluación - Experimento Tradicional</h1>
            <hr />
            <div className='d-flex align-items-center mt-5' style={{ height: "-webkit-fill-available" }}>
              <div className='w-50'>
                <Table striped bordered hover>
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
                            {row.time}
                            
                          </td>
                          <td className='text-center align-middle'>
                            {row.risk }
                            
                          </td>
                          <td className='text-center align-middle'>
                            {row.arrival }
                            
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
                <div className='w-100 d-flex justify-content-around p-3'>
                  {starExperiment ?
                    <Button className="d-flex align-items-center" variant='success' onClick={() => {
                      if (highlighted !== null) {
                        setStepLevel('Step1');
                        startCapture();
                      } else {
                        Swal.fire({
                          icon: 'error',
                          title: 'No has seleccionado ningúna solución',
                          html: 'Por favor selecciona una solución antes de continuar.',
                          width: '50%',
                          confirmButtonColor: "#d33",
                          confirmButtonText: "OK"
                        });
                      }
                    }
                    }>
                      <Check className='me-1' weight="bold" /> Elegir y salir
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

              <div className='w-50 h-100'>
                <ResponsiveParallelCoordinates
                  data={dataGraph}
                  variables={[
                    {
                      id: 'time',
                      label: 'Tiempo',
                      value: 'time',
                      min: '0',
                      max: '1',
                      ticksPosition: 'before',
                      legendPosition: 'start',
                      legendOffset: 20
                    },
                    {
                      id: 'risk',
                      label: 'Riesgo',
                      value: 'risk',
                      min: '0',
                      max: '1',
                      ticksPosition: 'before',
                      legendPosition: 'start',
                      legendOffset: 20
                    },
                    {
                      id: 'arrival',
                      label: 'Llegada',
                      value: 'arrival',
                      min: '0',
                      max: '1',
                      ticksPosition: 'before',
                      legendPosition: 'start',
                      legendOffset: 20
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
              <div className='d-flex justify-content-center align-items-center' style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 9999 }}>
                <Lottie animationData={AnimationLoading} style={{ width: 200, height: 200 }} />
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
                      stopCapture();
                      setStepLevel('');
                    }}>
                    <ArrowCounterClockwise className="me-1" weight="bold" />Repetir experimento
                  </Button>
                  <Button
                    className='d-flex align-items-center'
                    variant="success"
                    onClick={() => {
                      Swal.fire({
                        title: 'Experimento completado',
                        text: '¡Has completado el experimento exitosamente!',
                        icon: 'success',
                        confirmButtonColor: "#198754",
                        confirmButtonText: "Siguiente"
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
      {renderStepContent(stepLevel)}
    </div>
  );
}