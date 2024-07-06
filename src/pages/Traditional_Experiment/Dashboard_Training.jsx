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

// Importing theme customizations for the graph Parallel Coordinates
import themeResposiveParallelCoordinates from '../../config/themeResponsiveParallelCoordinates.json';

// Importing Lottie Files
import AnimationLoading from '../../assets/AnimationLoading.json';

// Importing Icons
import { Check, Prohibit, ArrowCounterClockwise } from "@phosphor-icons/react";

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


export default function Dashboard_Training({ setStepLevel, updateSteps, setStep, setStepsCompleted }) {
  const [starExperiment, setStartExperiment] = useState(false);
  const [loading, setLoading] = useState(false);

  const [highlighted, setHighlighted] = useState(null);
  const [selections, setSelections] = useState([null, null, null, null]);
  const [colors, setColors] = useState(data_default.map(row => row.color));

  const [dataGraph, setDataGraph] = useState(data_default);

  const getSolutions = async () => {
    setLoading(true);

    await axios.get('http://127.0.0.1:4000/API/Solutions_Experiment_Traditional')
      .then((response) => {
        const data = response.data.solutions;
        setDataGraph(data);
        setLoading(false);
        setStartExperiment(true);
      })
      .catch((error) => {
        console.log(error);
      });

  }

  const updateSolutions = async () => {
    const selected = selections.filter(selection => (selection !== null && selection !== ''));
    if (selected.length !== 4) {
      Swal.fire({
        icon: 'warning',
        title: 'Prueba no completada',
        html: 'Debe seleccionar un orden de preferencia para cada fila para poder actualizar las soluciones.',
        width: '50%',
        confirmButtonColor: "#d33",
        confirmButtonText: "OK",
        allowOutsideClick: false
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

  return (
    <>
      <h1 className='mb-0'>Entrenamiento - Experimento Tradicional</h1>
      <hr />
      <div className='d-flex align-items-center' style={{ height: "-webkit-fill-available" }}>
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
                      {row.time}
                    </td>
                    <td className='text-center align-middle'>
                      {row.risk}
                    </td>
                    <td className='text-center align-middle'>
                      {row.arrival}
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
          <div className='w-100 d-flex justify-content-around p-3'>
            {starExperiment ?
              <Button
                className='d-flex align-items-center'
                variant='danger'
                onClick={() => {
                  const selected = selections.filter(selection => (selection !== null && selection !== ''));
                  if (selected.length !== 4) {
                    Swal.fire({
                      icon: 'warning',
                      title: 'Prueba no completada',
                      html: 'Debes seleccionar un orden de preferencia para cada fila.',
                      width: '50%',
                      confirmButtonColor: "#d33",
                      confirmButtonText: "OK",
                      allowOutsideClick: false
                    });
                  } else {
                    Swal.fire({
                      icon: 'success',
                      title: 'Prueba completada',
                      html: 'Has completado la prueba de entrenamiento. <br> Ahora puedes continuar con la evaluación.',
                      width: '50%',
                      confirmButtonColor: "#1A8754",
                      confirmButtonText: "Siguiente",
                      allowOutsideClick: false
                    }).then((result) => {
                      axios.post('http://127.0.0.1:4000/API/UpdatePhase', {
                        email: JSON.parse(sessionStorage.getItem('profile')).email,
                        phase: 'Traditional_Experiment_Training',
                        phase_completed: 'Traditional_Experiment_Assessment'
                      }).then((response) => {
                        console.log(response.data);
                      }).catch((error) => {
                        console.log(error);
                      })
                      updateSteps('Traditional_Experiment_Training');
                      setStep('Traditional_Experiment_Assessment');
                      setStepsCompleted('Traditional_Experiment_Assessment');
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
                    title: 'Prueba no completada',
                    html: '¿Estás seguro de que deseas salir de la prueba? <br> Los datos no se guardarán.',
                    confirmButtonColor: "#d33",
                    confirmButtonText: "Salir",
                    allowOutsideClick: false
                  }).then((result) => {
                    if (result.isConfirmed) {
                      setStepLevel('');
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
}