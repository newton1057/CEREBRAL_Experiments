import './App.css'
import Button from 'react-bootstrap/Button';
import { ExclamationMark, Check } from "@phosphor-icons/react";
import Accordion from 'react-bootstrap/Accordion';
import NavBar from './components/NavBar';
import Introduction from './pages/Introduction/Introduction';
import { useEffect, useRef, useState } from 'react';
import Traditional_Experiment_Training from './pages/Traditional_Experiment/Training';
import Traditional_Experiment_Assessment from './pages/Traditional_Experiment/Assessment';
import Traditional_Experiment_Quiz from './pages/Traditional_Experiment/Quiz';
import Simulated_Experiment_Training from './pages/Simulated_Experiment/Training';
import Simulated_Experiment_Assesment from './pages/Simulated_Experiment/Assessment';
import Simulated_Experiment_Quiz from './pages/Simulated_Experiment/Quiz';
import Comparison_Between_Experiments from './pages/Comparison_Between_Experiments';
import Finish from './pages/Finish';
import Img1 from './assets/img1.png';
import Img2 from './assets/img2.png';
import axios from 'axios';

export default function App() {
  const [showModalProfile, setShowModalProfile] = useState(false); // State to show or hide the Modal_Profile component

  const handleCloseModalProfile = () => setShowModalProfile(false); // Function to hide the Modal_Profile component
  const handleShowModalProfile = () => setShowModalProfile(true); // Function to show the Modal_Profile component


  const [logged, setLogged] = useState(false);
  const [step, setStep] = useState('');
  const [steps, setSteps] = useState([]);
  const [stepsCompleted, setStepsCompleted] = useState([]);

  const updateSteps = (step) => {
    setSteps([...steps, step]);
    //sessionStorage.setItem('steps', JSON.stringify([...steps, step]));
  }

  const updateStepsCompleted = (step) => {
    setStepsCompleted([...stepsCompleted, step]);
  }

  const sideBarRef = useRef();

  useEffect(() => {
    const profile = JSON.parse(sessionStorage.getItem('profile'));

    // If the user is logged in, get the steps and steps completed
    if (profile !== null) {
      axios.post('http://127.0.0.1:4000/API/GetPhases', {
        email: profile.email // Get the email from the profile
      }).then((response) => {
        const phases = response.data.Phases; // Get the phases from the response
        setSteps(phases); // Set the steps

        const Phases_Completed = response.data.Phases_Completed; // Get the phases completed from the response
        setStepsCompleted(Phases_Completed); // Set the steps completed
      }
      ).catch((error) => {
        console.log(error);
      }
      );
      setLogged(true); // Set the user as logged
      setStep('Introduction'); // Set the step as Introduction (First step)
    } else {
      setLogged(false); // Set the user as not logged
      setStep(''); // Set the step as empty
    }
  }, []);

  return (
    <>
      <div className='App d-flex flex-column' style={{ height: "100vh" }}>
        <NavBar showModalProfile={showModalProfile} handleCloseModalProfile={handleCloseModalProfile} handleShowModalProfile={handleShowModalProfile} logged={logged} setLogged={setLogged} setStep={setStep} updateSteps={updateSteps} setStepsCompleted={updateStepsCompleted} />
        <div className="d-flex" style={{ height: "90%" }}>
          {step !== '' &&
            <>
              <div className='SideBar d-flex flex-column w-25 p-3 gap-3 position-relative'>
                <hr style={{
                  width: '640px',
                  margin: '10px 0px 10px 25px',
                  position: 'absolute',
                  transform: 'rotate(90deg)',
                  transformOrigin: 'left',
                  zIndex: 1
                }} />
                <Button
                  className='d-flex align-items-center w-100 gap-3 text-start z-3'
                  variant="light"
                  disabled={!stepsCompleted.includes('Introduction')}
                  onClick={() => setStep('Introduction')}
                >
                  {steps.includes('Introduction') ?
                    <>
                      <div className='Indicator-Step-Success'>
                        <Check weight="bold" />
                      </div>
                    </>
                    :
                    <>
                      <div className='Indicator-Step'>
                        <ExclamationMark weight="bold" />
                      </div>
                    </>
                  }
                  Introducción
                </Button>
                <Accordion defaultActiveKey="0" alwaysOpen>
                  <Accordion.Item eventKey="0">
                    <Accordion.Header onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      
                    }}
                    aria-disabled='true'
                    aria-expanded='false'>
                      {steps.includes('Traditional_Experiment_Training') & steps.includes('Traditional_Experiment_Assessment') & steps.includes('Traditional_Experiment_Quiz') & steps.includes('Simulated_Experiment_Training') & steps.includes('Simulated_Experiment_Assesment') & steps.includes('Simulated_Experiment_Quiz') ?
                        <>
                          <div className='Indicator-Step-Success'>
                            <Check weight="bold" />
                          </div>
                        </>
                        :
                        <>
                          <div className='Indicator-Step'>
                            <ExclamationMark weight="bold" />
                          </div>
                        </>
                      }
                      Experimentos
                    </Accordion.Header>
                    <Accordion.Body>
                      <p className='ms-3'>Experimento Tradicional</p>
                      <div className='d-flex flex-column gap-3 mb-3 ms-3'>
                        <hr style={{
                          width: '130px',
                          margin: '10px 0px 10px 25px',
                          position: 'absolute',
                          transform: 'rotate(90deg)',
                          transformOrigin: 'left',
                          zIndex: 1
                        }} />
                        <Button
                          className='d-flex align-items-center w-100 gap-3 text-start z-3'
                          variant="light"
                          disabled={!stepsCompleted.includes('Traditional_Experiment_Training')}
                          onClick={() => setStep('Traditional_Experiment_Training')}
                        >
                          {steps.includes('Traditional_Experiment_Training') ?
                            <>
                              <div className='Indicator-Step-Success'>
                                <Check weight="bold" />
                              </div>
                            </>
                            :
                            <>
                              <div className='Indicator-Step'>
                                <ExclamationMark weight="bold" />
                              </div>
                            </>
                          }
                          Entrenamiento
                        </Button>
                        <Button
                          className='d-flex align-items-center w-100 gap-3 text-start z-3'
                          variant="light"
                          disabled={!stepsCompleted.includes('Traditional_Experiment_Assessment')}
                          onClick={() => setStep('Traditional_Experiment_Assessment')}
                        >
                          {steps.includes('Traditional_Experiment_Assessment') ?
                            <>
                              <div className='Indicator-Step-Success'>
                                <Check weight="bold" />
                              </div>
                            </>
                            :
                            <>
                              <div className='Indicator-Step'>
                                <ExclamationMark weight="bold" />
                              </div>
                            </>
                          }
                          Evaluación
                        </Button>
                        <Button
                          className='d-flex align-items-center w-100 gap-3 text-start z-3'
                          variant="light"
                          disabled={!stepsCompleted.includes('Traditional_Experiment_Quiz')}
                          onClick={() => setStep('Traditional_Experiment_Quiz')}
                        >
                          {steps.includes('Traditional_Experiment_Quiz') ?
                            <>
                              <div className='Indicator-Step-Success'>
                                <Check weight="bold" />
                              </div>
                            </>
                            :
                            <>
                              <div className='Indicator-Step'>
                                <ExclamationMark weight="bold" />
                              </div>
                            </>
                          }
                          Cuestionario
                        </Button>
                      </div>
                      <hr />
                      <p className='ms-3'>Experimento Simulación</p>
                      <div className='d-flex flex-column gap-3 ms-3'>
                        <hr style={{
                          width: '130px',
                          margin: '10px 0px 10px 25px',
                          position: 'absolute',
                          transform: 'rotate(90deg)',
                          transformOrigin: 'left',
                          zIndex: 1
                        }} />
                        <Button
                          className='d-flex align-items-center w-100 gap-3 text-start z-3'
                          variant="light"
                          disabled={!stepsCompleted.includes('Simulated_Experiment_Training')}
                          onClick={() => setStep('Simulated_Experiment_Training')}
                        >
                          {steps.includes('Simulated_Experiment_Training') ?
                            <>
                              <div className='Indicator-Step-Success'>
                                <Check weight="bold" />
                              </div>
                            </>
                            :
                            <>
                              <div className='Indicator-Step'>
                                <ExclamationMark weight="bold" />
                              </div>
                            </>
                          }
                          Entrenamiento
                        </Button>
                        <Button
                          className='d-flex align-items-center w-100 gap-3 text-start z-3'
                          variant="light"
                          disabled={!stepsCompleted.includes('Simulated_Experiment_Assesment')}
                          onClick={() => setStep('Simulated_Experiment_Assesment')}
                        >
                          {steps.includes('Simulated_Experiment_Assesment') ?
                            <>
                              <div className='Indicator-Step-Success'>
                                <Check weight="bold" />
                              </div>
                            </>
                            :
                            <>
                              <div className='Indicator-Step'>
                                <ExclamationMark weight="bold" />
                              </div>
                            </>
                          }
                          Evaluación
                        </Button>
                        <Button
                          className='d-flex align-items-center w-100 gap-3 text-start z-3'
                          variant="light"
                          disabled={!stepsCompleted.includes('Simulated_Experiment_Quiz')}
                          onClick={() => setStep('Simulated_Experiment_Quiz')}
                        >
                          {steps.includes('Simulated_Experiment_Quiz') ?
                            <>
                              <div className='Indicator-Step-Success'>
                                <Check weight="bold" />
                              </div>
                            </>
                            :
                            <>
                              <div className='Indicator-Step'>
                                <ExclamationMark weight="bold" />
                              </div>
                            </>
                          }
                          Cuestionario
                        </Button>
                      </div>
                    </Accordion.Body>
                  </Accordion.Item>
                </Accordion>
                <Button
                  className='d-flex align-items-center w-100 gap-3 text-start z-3'
                  variant="light"
                  disabled={!stepsCompleted.includes('Comparison_Between_Experiments')}
                  onClick={() => setStep('Comparison_Between_Experiments')}
                >
                  {steps.includes('Comparison_Between_Experiments') ?
                    <>
                      <div className='Indicator-Step-Success'>
                        <Check weight="bold" />
                      </div>
                    </>
                    :
                    <>
                      <div className='Indicator-Step'>
                        <ExclamationMark weight="bold" />
                      </div>
                    </>
                  }
                  Comparación Experimentos
                </Button>
                <Button
                  className='d-flex align-items-center w-100 gap-3 text-start z-3'
                  variant="light"
                  disabled={!stepsCompleted.includes('Finish')}
                  onClick={() => setStep('Finish')}
                >
                  {steps.includes('Finish') ?
                    <>
                      <div className='Indicator-Step-Success'>
                        <Check weight="bold" />
                      </div>
                    </>
                    :
                    <>
                      <div className='Indicator-Step'>
                        <ExclamationMark weight="bold" />
                      </div>
                    </>
                  }
                  Finalizar Experimento
                </Button>
              </div>
            </>
          }

          <div className='Page p-5' style={step === '' ? { width: "100%" } : {}}>
            {step === '' &&
              <>
                <div className='d-flex flex-column justify-content-between'>
                  <h1 className='mt-5'>Bienvenido al experimento</h1>
                  <hr />
                  <div className='p-5'>
                    <div className='d-flex align-items-center justify-content-between'>
                      <p className='w-75'>En un problema de optimización multiobjetivo, un tomador de decisiones tiene que elegir la solución no dominada preferida de un conjunto de soluciones compromiso, conocidas como Frente de Pareto. Una forma de hacerlo es a través de un enfoque interactivo, donde un motor de búsqueda mejora gradualmente y guía la búsqueda hacia la región del frente de Pareto definida por las preferencias del tomador de decisiones. </p>
                      <img src={Img1} style={{ width: '15%' }} />
                    </div>
                    <div className='d-flex align-items-center justify-content-between'>
                      <img src={Img2} style={{ width: '15%' }} />
                      <p className='w-75'>En este trabajo, obtenemos información de las preferencias del tomador de decisiones con base en sus emociones. Las cuales se obtienen después de observar una simulación realista del desempeño de cada alternativa no dominada. Para ilustrar el marco propuesto, probamos un problema multicriterio de diseñar un controlador para un robot virtual. </p>
                    </div>
                  </div>
                  <hr />
                  <div className='d-flex justify-content-center mt-5'>
                    <Button className='d-flex align-items-center' variant="success" onClick={handleShowModalProfile}><Check className='me-2' weight="bold" />Iniciar experimento</Button>
                  </div>
                </div>
              </>
            }
            {step === 'Introduction' && <Introduction setStep={setStep} updateSteps={updateSteps} setStepsCompleted={updateStepsCompleted} />}

            {step === 'Traditional_Experiment_Training' && <Traditional_Experiment_Training setStep={setStep} updateSteps={updateSteps} setStepsCompleted={updateStepsCompleted} />}
            {step === 'Traditional_Experiment_Assessment' && <Traditional_Experiment_Assessment setStep={setStep} updateSteps={updateSteps} setStepsCompleted={updateStepsCompleted} />}
            {step === 'Traditional_Experiment_Quiz' && <Traditional_Experiment_Quiz setStep={setStep} updateSteps={updateSteps} setStepsCompleted={updateStepsCompleted} />}

            {step === 'Simulated_Experiment_Training' && <Simulated_Experiment_Training setStep={setStep} updateSteps={updateSteps} setStepsCompleted={updateStepsCompleted} />}
            {step === 'Simulated_Experiment_Assesment' && <Simulated_Experiment_Assesment setStep={setStep} updateSteps={updateSteps} setStepsCompleted={updateStepsCompleted} />}
            {step === 'Simulated_Experiment_Quiz' && <Simulated_Experiment_Quiz setStep={setStep} updateSteps={updateSteps} setStepsCompleted={updateStepsCompleted} />}
            {step === 'Comparison_Between_Experiments' && <Comparison_Between_Experiments setStep={setStep} updateSteps={updateSteps} setStepsCompleted={updateStepsCompleted} />}
            {step === 'Finish' && <Finish updateSteps={updateSteps} />}
          </div>
        </div>
      </div>
    </>
  )
}