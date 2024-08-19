// Dashboard Training
// Author: Eduardo Davila
// Date: 24/06/2024

// Importing Libraries
import { useState } from 'react';
import { Button } from 'react-bootstrap';
import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';
import { ResponsiveParallelCoordinates } from '@nivo/parallel-coordinates';
import Swal from 'sweetalert2';
import Lottie from "lottie-react";
import axios from 'axios';
import ProgressBar from 'react-bootstrap/ProgressBar';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

// Importing theme customizations for the graph Parallel Coordinates
import themeResposiveParallelCoordinates from '../../config/themeResponsiveParallelCoordinates.json';

// Importing Lottie Files
import AnimationLoading from '../../assets/AnimationLoading.json';

// Importing Icons
import { Check, Prohibit, ArrowCounterClockwise } from "@phosphor-icons/react";

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

export default function Dashboard_Training({ setStepLevel, updateSteps, setStep, setStepsCompleted }) {
  // States for the component
  const [starExperiment, setStartExperiment] = useState(false); // State to start the experiment
  const [loading, setLoading] = useState(false); // State to show the loading animation
  const [highlighted, setHighlighted] = useState(null); // State to highlight the selected row
  const [selections, setSelections] = useState([null, null, null, null]); // State to store the selected values
  const [colors, setColors] = useState(data_default.map(row => row.color)); // State to store the colors of the rows
  const [dataGraph, setDataGraph] = useState(data_default); // Data for the Parallel Coordinates Graph (Default and Updated)

  // Normalization of the data for the Parallel Coordinates Graph
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

  // Function to handle the change of the select
  const handleSelectChange = (index, event) => {
    const newSelections = [...selections]; // Copying the selections
    newSelections[index] = event.target.value; // Updating the selection
    setSelections(newSelections); // Updating the state
  }

  // Function to render the options of the select
  const renderSelectOptions = (currentValue) => {
    const options = [1, 2, 3, 4]; // Options for the select
    return options
      .filter(option => !selections.includes(String(option)) || String(option) === currentValue)
      .map(option => <option key={option} value={option}>{`${option}°`}</option>);
  }

  return (
    <>
      <h1 className='mb-0'>Entrenamiento - Experimento Tradicional</h1>
      <hr />
      <div className='d-flex align-items-center' style={{ height: "-webkit-fill-available" }}>
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
                        // First, restore the color of the previous cell
                        const newColors = [...colors];

                        if (highlighted !== null) {
                          newColors[highlighted] = data_default[highlighted].color;
                        }

                        // Change the color of the cell
                        newColors[index] = '#13F2BD';

                        // Update the state
                        setColors(newColors);
                        setHighlighted(index);
                      } else {
                        // Restores the color of the cell
                        const newColors = [...colors];
                        newColors[index] = data_default[index].color;

                        // Update the state
                        setColors(newColors);
                        setHighlighted(null);
                      }
                    }}
                    style={{ backgroundColor: highlighted === index ? '#D9FAEA' : 'white' }}
                  >
                    <td className='text-center align-middle'>
                      {parseFloat(row.time).toFixed(4)}
                    </td>
                    <td className='text-center align-middle'>
                      {parseFloat(row.risk).toFixed(4)}
                    </td>
                    <td className='text-center align-middle'>
                      {parseFloat(row.arrival).toFixed(4)}
                    </td>
                    <td className='columnOrderPreference align-middle'>
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
                    <td className='columnOrderPreference align-middle'>
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
              <Button
                className='d-flex align-items-center'
                variant='danger'
                onClick={() => {
                  const selected = selections.filter(selection => (selection !== null && selection !== '')); // Filtering the selected values

                  if (selected.length !== 4) { // Validating that the user has selected an order of preference for each row
                    Swal.fire({
                      icon: 'error',
                      title: 'Prueba no completada',
                      html: 'Debes seleccionar un orden de preferencia para cada fila para acompletar la prueba.',
                      width: '30%',
                      confirmButtonColor: "#dc3545",
                      confirmButtonText: "Entiendo",
                      allowOutsideClick: false
                    });
                  } else {
                    Swal.fire({
                      icon: 'success',
                      title: 'Prueba completada',
                      html: 'Has completado la prueba de entrenamiento. <br> Ahora puedes continuar con la evaluación.',
                      width: '30%',
                      confirmButtonColor: "#1A8754",
                      confirmButtonText: "Siguiente",
                      allowOutsideClick: false
                    }).then(() => {
                      axios.post('http://127.0.0.1:4000/API/UpdatePhase', {
                        email: JSON.parse(sessionStorage.getItem('profile')).email, // User email
                        phase: 'Traditional_Experiment_Training', // Phase
                        phase_completed: 'Traditional_Experiment_Assessment' // Phase completed
                      }).then((response) => {
                        console.log(response.data);
                      }).catch((error) => {
                        console.log(error);
                      })

                      updateSteps('Traditional_Experiment_Training'); // Updating the steps
                      setStep('Traditional_Experiment_Assessment'); // Setting the step
                      setStepsCompleted('Traditional_Experiment_Assessment'); // Setting the steps completed
                    });
                  }
                }
                }
              >
                <Check className='me-2' weight="bold" />Terminar prueba
              </Button>
              :
              <Button
                className='d-flex align-items-center'
                variant='danger'
                onClick={() => (
                  Swal.fire({
                    icon: 'warning',
                    title: 'Prueba no comenzada',
                    html: '¿Estás seguro de que deseas salir de la prueba?',
                    width: '30%',
                    confirmButtonColor: "#dc3545",
                    confirmButtonText: "Salir",
                    cancelButtonText: "Cancelar",
                    showCancelButton: true,
                    cancelButtonColor: "#6C757D",
                    allowOutsideClick: false,
                    reverseButtons: true
                  }).then((result) => {
                    if (result.isConfirmed) {
                      setStepLevel(''); // Resetting the step level
                    }
                  }))
                }>
                <Prohibit className='me-2' weight="bold" />Cancelar
              </Button>
            }

            {starExperiment ?
              <>
                <Button
                  className='d-flex align-items-center'
                  variant='success'
                  onClick={updateSolutions}
                >
                  <ArrowCounterClockwise className='me-2' weight="bold" />Generar soluciones
                </Button>
              </>
              :
              <>
                <Button
                  className='d-flex align-items-center'
                  variant='success'
                  onClick={getSolutions}
                >
                  <Check className='me-2' weight="bold" />Iniciar
                </Button>
              </>
            }
          </div>
        </div>

        <div className='h-100 p-3'
          style={{ width: '65%' }}>
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
}