import ReactPlayer from 'react-player';
import VideoIntroduction from '../../assets/Videos/Experimento Grafica.mp4';
import { useState } from 'react';
import { Button } from 'react-bootstrap';
import Dashboard_Training from './Dashboard_Training';
import axios from 'axios';

// Importing Icons
import { Check , Prohibit } from "@phosphor-icons/react";

export default function Traditional_Experiment_Training( {setStep, updateSteps, setStepsCompleted} ) {

  const [completeVideo, setCompleteVideo] = useState(false);

  const [stepLevel, setStepLevel] = useState('');

  const handleNextStep = () => {
    
    setStepLevel('Step1');
  }

  const renderStepContent = (currentStep) => {
    switch (currentStep) {
      case '':
        return (
          <>
            <h1 className='mb-0'>Entrenamiento - Experimento Tradicional</h1>
            <hr />
            <div className='w-100 h-75 d-flex justify-content-center'>
              <ReactPlayer
                url={VideoIntroduction}
                controls={true}
                muted={false}
                width='100%'
                height='100%'
                onEnded={() => setCompleteVideo(true)}
              />
            </div>
            <hr />
            <div className='w-100 d-flex justify-content-end gap-5'>
              <Button className='d-flex align-items-center' variant="success" disabled={!completeVideo} onClick={handleNextStep}><Check className='me-2' weight="bold" />Siguiente</Button>
            </div>
          </>
        );
      case 'Step1':
        return (
          <Dashboard_Training setStepLevel={setStepLevel} updateSteps={updateSteps} setStep={setStep} setStepsCompleted={setStepsCompleted}/>
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