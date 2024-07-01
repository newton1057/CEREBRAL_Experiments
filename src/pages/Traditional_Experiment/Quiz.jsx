import { Form } from "react-bootstrap";
import { useState } from "react";
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Swal from 'sweetalert2';
import axios from 'axios';

// Importing Icons
import { Prohibit, Play, ArrowCounterClockwise, Check } from "@phosphor-icons/react";

export default function Traditional_Experiment_Quiz({setStep,updateSteps, setStepsCompleted}) {
  const [validated, setValidated] = useState(false);

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
      console.log('data', data);
      sessionStorage.setItem('Traditional_Experiment_Quiz', JSON.stringify(data));

      await axios.post('http://127.0.0.1:4000/API/Quiz_Experiment_Traditional', {
        email: JSON.parse(sessionStorage.getItem('profile')).email,
        data: data
      }).then((response) => {
        console.log(response.data);
        Swal.fire({
          icon: 'success',
          title: 'Cuestionario completado',
          text: 'Perfecto, has completado el cuestionario.',
          width: '50%',
          confirmButtonColor: "#198754",
          confirmButtonText: "Siguiente",
        }).then( (result) => {
          console.log('result', result);
          setStep('Simulated_Experiment_Training');
          updateSteps('Traditional_Experiment_Quiz');
          setStepsCompleted('Simulated_Experiment_Training');
          axios.post('http://127.0.0.1:4000/API/UpdatePhase', {
            email: JSON.parse(sessionStorage.getItem('profile')).email,
            phase: 'Traditional_Experiment_Quiz',
            phase_completed: 'Simulated_Experiment_Training'
          })
          .then((response) => {
            console.log(response);
          })
          .catch((error) => {
            console.log(error);
          }
          );
        });
      }).catch((error) => {
        console.log(error);
      });
    }
    setValidated(true);
  };
  return (
    <div>
      <h1>Cuestionario - Experimento Tradicional</h1>
      <div className="mt-5 ps-5 pe-5">
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Form.Group>
              <FloatingLabel controlId="floatingSelect" label="Se requirió mucha actividad mental (e.g., pensar, decidir, o recordar).*">
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
              <FloatingLabel controlId="floatingSelect" label="Encontrar la solución preferida fue simple.*">
                <Form.Select aria-label="Floating label select example" name='question2' required >
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
              <FloatingLabel controlId="floatingSelect" label="Me esforcé mucho para encontrar mi solución preferida.*">
                <Form.Select aria-label="Floating label select example" name='question3' required >
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
              <FloatingLabel controlId="floatingSelect" label="Sentí frustración en el proceso de solución (e.g., inseguridad, estrés, desánimo, irritación).*">
                <Form.Select aria-label="Floating label select example" name='question4' required >
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
              <FloatingLabel controlId="floatingSelect" label="Tomó muchas iteraciones llegar a una solución aceptable.*">
                <Form.Select aria-label="Floating label select example" name='question5' required >
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
              <FloatingLabel controlId="floatingSelect" label="La información de preferencias fue fácil de proporcionar.*">
                <Form.Select aria-label="Floating label select example" name='question6' required >
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
              <FloatingLabel controlId="floatingSelect" label="Los comportamientos del robot generados en cada fase reflejaron mis preferencias/emociones.*">
                <Form.Select aria-label="Floating label select example" name='question6' required >
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
              <FloatingLabel controlId="floatingSelect" label="Fue fácil aprender a usar el método.*">
                <Form.Select aria-label="Floating label select example" name='question7' required >
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
              <FloatingLabel controlId="floatingSelect" label="Me detuve porque estoy satisfech@ con la solución final.*">
                <Form.Select aria-label="Floating label select example" name='question8' required >
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
              <FloatingLabel controlId="floatingSelect" label="Me detuve por cansancio.*">
                <Form.Select aria-label="Floating label select example" name='question9' required >
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
          <hr />
          <div className='d-flex justify-content-end gap-4'>
            <Button
              className="d-flex align-items-center"
              variant="success"
              type="submit"
            >
              <Check className="me-2" weight="bold" />Siguiente
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}