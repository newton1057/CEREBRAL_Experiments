// Page: Introduction
// Author: Eduardo Davila
// Date: 24/06/2024

// Importing Libraries
import { useState } from 'react';
import ReactPlayer from 'react-player'
import { Button } from 'react-bootstrap';
import axios from 'axios';

// Importing Videos
import VideoIntroduction from '../../assets/Videos/Intro.mp4'

// Importing Icons
import { Check } from "@phosphor-icons/react";

export default function Introduction( { setStep , updateSteps , setStepsCompleted } ) {
  const [completeVideo, setCompleteVideo] = useState(false);

  const handleSetStep = async () => {
    const email = JSON.parse(sessionStorage.getItem('profile')).email;
    await axios.post('http://127.0.0.1:4000/API/UpdatePhase', {
      email: email,
      phase: 'Introduction',
      phase_completed: 'Traditional_Experiment_Training'
    }).then((response) => {
      console.log(response.data);
      setStep('Traditional_Experiment_Training');
      updateSteps('Introduction');
      setStepsCompleted('Traditional_Experiment_Training');
    }).catch((error) => {
      console.log(error);
    });
  }

  return (
    <div className='w-100 h-100 d-flex flex-column justify-content-between'>
      <h1 className='mb-0'>Introducción</h1>
      <hr />
      <div className='w-100 h-75 d-flex justify-content-center'>
        <ReactPlayer
          url={VideoIntroduction}
          controls={true}
          muted={true}
          width='100%'
          height='100%'
          onEnded={() => setCompleteVideo(true)}
        />
      </div>
      <hr />
      <div className='w-100 d-flex justify-content-end gap-4'>
        <Button
          className='d-flex align-items-center'
          variant="success"
          disabled={!completeVideo}
          onClick={handleSetStep}
        >
          <Check className='me-2' weight="bold"/>Siguiente
        </Button>
      </div>
    </div>
  );
}