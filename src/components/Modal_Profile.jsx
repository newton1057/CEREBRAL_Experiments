import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { Check, ArrowRight, ArrowLeft, SignIn } from "@phosphor-icons/react";
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import { User } from "@phosphor-icons/react";

import { useState } from 'react';

import axios from 'axios';


export default function Modal_Profile({ show, handleClose, handleOpen, setLogged, setStep, updateSteps, setStepsCompleted }) {
  const [validatedFormProfile, setValidatedFormProfile] = useState(false);
  const [validatedFormLevel, setValidatedFormLevel] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const [validatedLogin, setValidatedLogin] = useState(false);
  const [error, setError] = useState('');


  // State for variables special for this component
  const [age, setAge] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmitLogin = async (event) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      // If the form is invalid, prevent the default behavior
      event.preventDefault();
      event.stopPropagation();
    } else {
      // If the form is valid, prevent the default behavior
      event.preventDefault();
      event.stopPropagation();

      const formData = new FormData(form); // Extract form data
      const data = Object.fromEntries(formData.entries()); // Convert FormData to an object

      await axios.post('http://127.0.0.1:4000/API/Login', {
        email: data.email,
        password: data.password
      }).then((response) => {
        if (response.status === 200) {
          console.log(response.data.profile);
          sessionStorage.setItem('profile', JSON.stringify(response.data.profile));
          sessionStorage.setItem('level', JSON.stringify(response.data.level));
          sessionStorage.setItem('permissions', JSON.stringify(response.data.permissions));
          sessionStorage.setItem('logged', true);
          window.location.reload();
        }
      }).catch((error) => {
        if (error.response.status === 400) {
          setError('Usuario o contraseña incorrectos');
        } else {
          if (error.response.status === 404) {
            setError('Usuario no encontrado');
          }
        }
      }
      );

    }

    setValidatedLogin(true);
  };




  const [modalShowSignIn, setModalShowSignIn] = useState(false);

  const handleShowSignIn = () => {
    handleClose();
    setModalShowSignIn(true)
  };

  const handleCloseSignIn = () => {
    handleOpen();
    setModalShowSignIn(false)
  };


  const handleSubmitProfile = (event) => {
    const form = event.currentTarget; // Get the form

    if (form.checkValidity() === false) {
      // If the form is invalid, prevent the default behavior
      event.preventDefault();
      event.stopPropagation();
    } else {
      // If the form is valid, prevent the default behavior
      event.preventDefault();
      event.stopPropagation();

      const formData = new FormData(form); // Extract form data
      const data = Object.fromEntries(formData.entries()); // Convert FormData to an object
      sessionStorage.setItem('profile', JSON.stringify(data)); // Save data to Session Storage
      setActiveTab('level'); // Switch to the next tab
    }
    setValidatedFormProfile(true);
  };

  const handleSubmitLevel = (event) => {
    const form = event.currentTarget; // Get the form

    if (form.checkValidity() === false) {
      // If the form is invalid, prevent the default behavior
      event.preventDefault();
      event.stopPropagation();
    } else {
      // If the form is valid, prevent the default behavior
      event.preventDefault();
      event.stopPropagation();

      const formData = new FormData(form); // Extract form data
      const data = Object.fromEntries(formData.entries()); // Convert FormData to an object
      sessionStorage.setItem('level', JSON.stringify(data)); // Save data to Session Storage
      setActiveTab('permissions'); // Switch to the next tab
    }
    setValidatedFormLevel(true);
  };

  const GoProfile = () => {
    setActiveTab('profile');
  }

  const GoLevel = () => {
    setActiveTab('level');
  }

  const handleSubmitPermissions = async (event) => {
    // Prevent the default behavior
    event.preventDefault();
    event.stopPropagation();

    const form = event.currentTarget; // Get the form
    const data = {
      "publicAnswers": form.elements.publicAnswers.checked,
      "contactedForExperiments": form.elements.contactedForExperiments.checked
    }; // Extract form data

    sessionStorage.setItem('permissions', JSON.stringify(data)); // Save data to Session Storage
    sessionStorage.setItem('logged', true); // Save data to Session Storage

    setLogged(true); // Set the logged state to true

    setStep('Introduction'); // Set the step state to Introduction
    setStepsCompleted('Introduction'); // Set the stepsCompleted state to Introduction

    const profile = JSON.parse(sessionStorage.getItem('profile')); // Get the profile data
    const level = JSON.parse(sessionStorage.getItem('level')); // Get the level data

    // POST data to the server
    await axios.post('http://127.0.0.1:4000/API/Users', {
      profile: profile,
      level: level,
      permissions: data
    }).then((response) => {
      console.log(response);
    }).catch((error) => {
      console.log(error);
    });

    await axios.post('http://127.0.0.1:4000/API/UpdatePhase', {
      email: profile.email,
      phase: '',
      phase_completed: 'Introduction'
    }).then((response) => {
      console.log(response);
    }).catch((error) => {
      console.log(error);
    });
    
    handleClose();
  };

  return (
    <>
      <Modal show={show} onHide={handleClose} size="xl" centered>
        <Modal.Header closeButton>
          <div className='w-100 pe-3 d-flex justify-content-between'>
            <Modal.Title className='d-flex align-items-center'><User className='me-2' />Perfil</Modal.Title>
            <Button className='d-flex align-items-center' variant='success' onClick={handleShowSignIn}><SignIn className='me-2' weight="bold" />Iniciar sesión</Button>
          </div>
        </Modal.Header>
        <Modal.Body>
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            id="tab-profile"
            className="mb-3"
          >
            <Tab aria-controls='profile' eventKey="profile" title="Perfil" disabled>
              <Form noValidate validated={validatedFormProfile} onSubmit={handleSubmitProfile}>
                <Row className="mb-3">
                  <Form.Group as={Col} md="4">
                    <FloatingLabel
                      controlId="floatingInput"
                      label="Iniciales *"
                      className="mb-3"
                    >
                      <Form.Control type="text" name="initials" placeholder="" required />
                      <Form.Control.Feedback type="invalid">
                        Introduce tus iniciales.
                      </Form.Control.Feedback>
                    </FloatingLabel>

                  </Form.Group>
                </Row>
                <Row className="mb-3">
                  <Form.Group as={Col} md="4">
                    <FloatingLabel
                      controlId="floatingInput"
                      label="Nombres *"
                      className="mb-3"
                    >
                      <Form.Control type="text" name='name' placeholder="" required />
                      <Form.Control.Feedback type="invalid">
                        Introduce tus nombres.
                      </Form.Control.Feedback>
                    </FloatingLabel>
                  </Form.Group>
                  <Form.Group as={Col} md="4">
                    <FloatingLabel
                      controlId="floatingInput"
                      label="Apellido paterno *"
                      className="mb-3"
                    >
                      <Form.Control type="text" name='fatherLastName' placeholder="" required />
                      <Form.Control.Feedback type="invalid">
                        Introduce tu apellido paterno.
                      </Form.Control.Feedback>
                    </FloatingLabel>
                  </Form.Group>
                  <Form.Group as={Col} md="4">
                    <FloatingLabel
                      controlId="floatingInput"
                      label="Apellido materno *"
                      className="mb-3"
                    >
                      <Form.Control type="text" name='motherLastName' placeholder="" required />
                      <Form.Control.Feedback type="invalid">
                        Introduce tu apellido materno.
                      </Form.Control.Feedback>
                    </FloatingLabel>
                  </Form.Group>
                </Row>
                <Row className="mb-3">
                  <Form.Group as={Col} md="4">
                    <FloatingLabel
                      controlId="floatingInput"
                      label="Edad *"
                      className="mb-3"
                    >
                      <Form.Control
                        type="text"
                        name='age'
                        placeholder=""
                        value={age}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Only allow numeric characters
                          if (/^\d*$/.test(value)) {
                            setAge(value);
                          }
                        }}
                        required />
                      <Form.Control.Feedback type="invalid">
                        Introduce tu edad.
                      </Form.Control.Feedback>
                    </FloatingLabel>
                  </Form.Group>
                  <Form.Group as={Col} md="4">
                    <FloatingLabel
                      controlId="floatingInput"
                      label="Correo electrónico *"
                      className="mb-3"
                    >
                      <Form.Control type="email" name='email' placeholder="" required />
                      <Form.Control.Feedback type="invalid">
                        Introduce tu correo electrónico.
                      </Form.Control.Feedback>
                    </FloatingLabel>
                  </Form.Group>
                  <Form.Group as={Col} md="4">
                    <FloatingLabel
                      controlId="floatingInput"
                      label="Teléfono *"
                      className="mb-3"
                    >
                      <Form.Control
                        type="text"
                        name='phone'
                        placeholder=""
                        value={phone}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Only allow numeric characters
                          if (/^\d*$/.test(value)) {
                            setPhone(value);
                          }
                        }}
                        required />
                      <Form.Control.Feedback type="invalid">
                        Introduce tu teléfono.
                      </Form.Control.Feedback>
                    </FloatingLabel>
                  </Form.Group>
                </Row>

                <Row className="mb-3">
                  <Form.Group as={Col} md="4">
                    <FloatingLabel
                      controlId="floatingInput"
                      label="Contraseña *"
                      className="mb-3"
                    >
                      <Form.Control type="text" name='password' placeholder="" required />
                      <Form.Control.Feedback type="invalid">
                        Introduce una contraseña.
                      </Form.Control.Feedback>
                    </FloatingLabel>
                  </Form.Group>
                  <Form.Group as={Col} md="4">
                    <FloatingLabel controlId="floatingSelect" label="Género">
                      <Form.Select aria-label="Floating label select example" name='gender' required >
                        <option value="">Selecciona...</option>
                        <option value="Male">Masculino</option>
                        <option value="Female">Femenino</option>
                        <option value="Other">Otro</option>
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        Introduce tu género.
                      </Form.Control.Feedback>
                    </FloatingLabel>
                  </Form.Group>
                  <Form.Group as={Col} md="4">
                    <FloatingLabel controlId="floatingSelect" label="Nivel educativo">
                      <Form.Select aria-label="Floating label select example" name='educationLevel' required>
                        <option value="">Selecciona...</option>
                        <option value="Degree">Licenciatura</option>
                        <option value="Master">Maestría</option>
                        <option value="Doctorate">Doctorado</option>
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        Introduce tu nivel educativo.
                      </Form.Control.Feedback>
                    </FloatingLabel>
                  </Form.Group>
                </Row>
                <hr />
                <div className='d-flex justify-content-end'>
                  <Button className='d-flex align-items-center' variant="success" type="submit"><ArrowRight className='me-2' weight="bold" />Siguiente</Button>
                </div>
              </Form>
            </Tab>
            <Tab aria-controls='level' eventKey="level" title="Nivel" disabled>
              <Form noValidate validated={validatedFormLevel} onSubmit={handleSubmitLevel}>
                <Row className="mb-3">
                  <Form.Group>
                    <FloatingLabel controlId="floatingSelect" label="¿Consideras que tienes algún grado de conocimiento de robots de servicio? *">
                      <Form.Select aria-label="Floating label select example" name='knowledgeOfServiceRobots' required >
                        <option value="">Selecciona...</option>
                        <option value="Yes">Si</option>
                        <option value="No">No</option>
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        Introduce tu género.
                      </Form.Control.Feedback>
                    </FloatingLabel>
                  </Form.Group>
                </Row>
                <Row className="mb-3">
                  <Form.Group controlId="validationCustom01">
                    <FloatingLabel controlId="floatingTextarea2" label="Si la respuesta es afirmativa, explica la razón *">
                      <Form.Control
                        as="textarea"
                        name='reason'
                        placeholder="Leave a comment here"
                        style={{ height: '100px' }}
                      />
                    </FloatingLabel>
                  </Form.Group>
                </Row>
                <Row className="mb-3">
                  <Form.Group controlId="validationCustom01">
                    <FloatingLabel controlId="floatingSelect" label="Nivel de familiaridad *">
                      <Form.Select aria-label="Floating label select example" name='familiarityLevel' required >
                        <option value="">Selecciona...</option>
                        <option value="Never seen a virtual or physical service robot">Nunca he visto un robot de servicio virtual o físico</option>
                        <option value="Seen virtual service robots">He visto robots de servicio virtuales</option>
                        <option value="Seen physical service robots">He visto robots de servicio físicos</option>
                        <option value="Seen both physical and virtual service robots">He visto robots de servicio físicos y virtuales</option>
                        <option value="Used service robots">He utilizado robots de servicio</option>
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        Introduce tu género.
                      </Form.Control.Feedback>
                    </FloatingLabel>
                  </Form.Group>
                </Row>

                <Row className="mb-3">
                  <Form.Group controlId="validationCustom01">
                    <FloatingLabel controlId="floatingSelect" label="Nivel de conocimiento *">
                      <Form.Select aria-label="Floating label select example" name='knowledgeLevel' required >
                        <option value="">Selecciona...</option>
                        <option value="Never programmed robots">Nunca he programado robots</option>
                        <option value="Programmed virtual robots">He programado robots virtuales</option>
                        <option value="Programmed physical robots">He programado robots físicos</option>
                        <option value="Programmed both physical and virtual robots">He programado robots físicos y virtuales</option>
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        Introduce tu género.
                      </Form.Control.Feedback>
                    </FloatingLabel>
                  </Form.Group>
                </Row>
                <hr />
                <div className='d-flex justify-content-end gap-4'>
                  <Button className='d-flex align-items-center' variant="secondary" onClick={GoProfile} ><ArrowLeft className='me-2' weight="bold" />Atrás</Button>
                  <Button className='d-flex align-items-center' variant="success" type="submit"><ArrowRight className='me-2' weight="bold" />Siguiente</Button>
                </div>
              </Form>
            </Tab>
            <Tab eventKey="permissions" title="Permisos" disabled>
              <Form onSubmit={handleSubmitPermissions}>
                <Form.Group className="mb-3">
                  <Form.Check

                    label="Estoy de acuerdo en que hagamos públicas tus respuestas sin compartir mi nombre."
                    //feedback="Tienes que estar de acuerdo antes de enviar."
                    name='publicAnswers'
                  //feedbackType="invalid"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Check
                    label="Estoy de acuerdo en ser contactado para futuros experimentos."
                    //feedback="Tienes que estar de acuerdo antes de enviar."
                    name='contactedForExperiments'
                  //feedbackType="invalid"
                  />
                </Form.Group>
                <hr />
                <div className='d-flex justify-content-end gap-4'>
                  <Button className='d-flex align-items-center' variant="secondary" onClick={GoLevel} ><ArrowLeft className='me-2' weight="bold" />Atrás</Button>
                  <Button className='d-flex align-items-center' variant="success" type="submit"><Check className='me-2' weight="bold" />Terminar</Button>
                </div>
              </Form>
            </Tab>
          </Tabs>
        </Modal.Body>
      </Modal>

      <Modal show={modalShowSignIn} onHide={handleCloseSignIn} size="sm" centered>
        <Modal.Header closeButton>
          <div className='w-100 pe-3 d-flex justify-content-between'>
            <Modal.Title className='d-flex align-items-center'><User className='me-2' />Iniciar sesión</Modal.Title>

          </div>
        </Modal.Header>
        <Modal.Body>
          <Form noValidate validated={validatedLogin} onSubmit={handleSubmitLogin}>
            <Row className="mb-3">
              <Form.Group as={Col} md="12">
                <FloatingLabel
                  controlId="floatingInput"
                  label="Correo electrónico *"
                  className="mb-3"
                >
                  <Form.Control type="email" name='email' placeholder="" required />
                  <Form.Control.Feedback type="invalid">
                    Introduce tu correo electrónico.
                  </Form.Control.Feedback>
                </FloatingLabel>
              </Form.Group>
            </Row>

            <Row className="mb-3">
              <Form.Group as={Col} md="12">
                <FloatingLabel
                  controlId="floatingInput"
                  label="Contraseña *"
                  className="mb-3"
                >
                  <Form.Control type="text" name='password' placeholder="" required />
                  <Form.Control.Feedback type="invalid">
                    Introduce tu contraseña.
                  </Form.Control.Feedback>
                </FloatingLabel>
              </Form.Group>
            </Row>
            <p className='text-danger text-center'><small>{error}</small></p>
            <hr />
            <div className='d-flex justify-content-center'>
              <Button className='d-flex align-items-center' variant="success" type="submit"><ArrowRight className='me-2' weight="bold" />Entrar</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>

  );
}

