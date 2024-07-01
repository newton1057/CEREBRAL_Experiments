// Page for the training of the simulated experiment
// Author: Eduardo Dávila
// Date: 30/06/2024

// Importing Libraries
import React, { useState } from 'react';
import ReactPlayer from 'react-player';
import VideoIntroduction from '../../assets/Videos/Experimento SAM.mp4';
import { Button } from 'react-bootstrap';

// Importing Components
import Dashboard_Training_Simulated_Experiment from './Dashboard_Training';

// Importing Icons
import { Check } from "@phosphor-icons/react";

export default function Simulated_Experiment_Training( { setStep , updateSteps, setStepsCompleted } ) {
  const [completeVideo, setCompleteVideo] = useState(false);
  const [stepLevel, setStepLevel] = useState('');

  const renderStepContent = (currentStep) => {
    switch (currentStep) {
      case '':
        return (
          <>
            <h1 className='mb-0'>Entrenamiento - Experimento Simulado</h1>
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
            <div className='w-100 d-flex justify-content-end gap-5'>
              <Button
                className='d-flex align-items-center'
                variant="success"
                onClick={() => setStepLevel('Step1')}
                disabled={!completeVideo}
              >
                <Check className='me-2' weight="bold" />Siguiente
              </Button>
            </div>

          </>
        );
      case 'Step1':
        return (
          <>
            <Dashboard_Training_Simulated_Experiment setStep={setStep} setStepLevel={setStepLevel} updateSteps={updateSteps} setStepsCompleted={setStepsCompleted}/>
          </>
        );
    }
  };

  return (
    <div className='w-100 h-100 d-flex flex-column justify-content-between'>
      {renderStepContent(stepLevel)}
    </div>
  );
}