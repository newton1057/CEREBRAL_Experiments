// Page: Finish
// Author: Eduardo Davila
// Date: 24/06/2024

// Importing Libraries
import { useState } from "react";
import ReactPlayer from "react-player";
import { Button } from "react-bootstrap";
import Swal from 'sweetalert2';
import axios from 'axios';

// Importing Videos
import VideoFinish from "../assets/Videos/Final.mp4";

// Importing Icons
import { Check } from "@phosphor-icons/react";

export default function Finish({ updateSteps }) {
  const [validated, setValidated] = useState(true);

  const handleNext = () => {
    setValidated(false);
  }

  return (
    <div className="d-flex flex-column w-100 h-100 justify-content-between">
      <h1 className="mb-0">Finalizar experimento</h1>
      <hr />
      <div className='w-100 h-75 d-flex justify-content-center'>
        <ReactPlayer
          url={VideoFinish}
          controls={true}
          muted={true}
          width='100%'
          height='100%'
          onEnded={handleNext}
        />
      </div>
      <hr />
      <div className='w-100 d-flex justify-content-end'>
        <Button className='d-flex align-items-center'
          variant="success"
          disabled={validated}
          onClick={() => {
            Swal.fire({
              title: '¡Felicidades!',
              text: 'Has completado la prueba exitosamente',
              icon: 'success',
              confirmButtonText: 'Continuar',
              confirmButtonColor: "#198754"
            }).then(async (result) => {
              
              await axios.post('http://127.0.0.1:4000/API/UpdatePhase', {
                email: JSON.parse(sessionStorage.getItem('profile')).email,
                phase: 'Finish',
                phase_completed: 'Finish'
              }).then((response) => {
                console.log(response);
                
              }).catch((error) => {
                console.log(error);
              });

              updateSteps('Finish');
              sessionStorage.clear();
              window.location.reload();
              
            });

          }}
        >
          <Check className='me-2' weight="bold" />Finalizar
        </Button>
      </div>
    </div>
  );
}