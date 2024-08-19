// Page: Finish
// Author: Eduardo Davila
// Date: 31/07/2024

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
  // State to validate the button
  const [validated, setValidated] = useState(true);

  // Function to handle the next button
  const handleNext = () => {
    setValidated(false);
  }

  const eventFinish = () => {
    Swal.fire({
      title: '¡Felicidades!',
      text: 'Has completado la prueba exitosamente',
      icon: 'success',
      confirmButtonText: 'Continuar',
      confirmButtonColor: "#198754",
      allowOutsideClick: false,
    }).then(async () => {
      
      // Update the phase
      await axios.post('http://127.0.0.1:4000/API/UpdatePhase', {
        email: JSON.parse(sessionStorage.getItem('profile')).email, // User Email
        phase: 'Finish', // Phase
        phase_completed: 'Finish' // Phase Completed
      }).then((response) => {
        console.log(response);
      }).catch((error) => {
        console.log(error);
      });
      
      updateSteps('Finish'); // Update the steps
      sessionStorage.clear(); // Clear the session storage
      window.location.reload(); // Reload the page
    });
  }

  return (
    <div className="d-flex flex-column w-100 h-100 justify-content-between">
      <h1 className="mb-0">Finalizar experimento</h1>
      <hr />
      <div className='w-100 h-75 d-flex justify-content-center'>
        <ReactPlayer url={VideoFinish} controls={true} muted={false} width='100%' height='100%' onEnded={handleNext} />
      </div>
      <hr />
      <div className='w-100 d-flex justify-content-end'>
        <Button className='d-flex align-items-center' variant="success" disabled={validated} onClick={eventFinish}><Check className='me-2' weight="bold" />Finalizar</Button>
      </div>
    </div>
  );
}