// NavBar component
// Author: Eduardo Dávila
// Date: 03/07/2024

// Importing libraries
import { useState } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import { User, Gear, SignOut } from "@phosphor-icons/react";

// Importing assets
import Logo_CEREBRAL from '../assets/Logo_CEREBRAL.png'; // Logo CEREBRAL 

// Importing components
import Modal_Profile from './Modal_Profile'; // Modal_Profile component

export default function NavBar({ showModalProfile, handleCloseModalProfile, handleShowModalProfile, logged, setLogged, setStep, updateSteps, setStepsCompleted }) {
  //const [showModalProfile, setShowModalProfile] = useState(false); // State to show or hide the Modal_Profile component
  //const handleCloseModalProfile = () => setShowModalProfile(false); // Function to hide the Modal_Profile component
  //const handleShowModalProfile = () => setShowModalProfile(true); // Function to show the Modal_Profile component

  // Function to sign out
  const handle_SignOut = () => {
    sessionStorage.clear(); // Clearing the session storage
    setLogged(false); // Setting the logged state to false
    window.location.reload(); // Reloading the page
  }

  return (
    <>
      {logged &&
        <div className='NavBar d-flex justify-content-between align-items-center p-3'>
          <div className='p-2 Container-Logo'>
            <img src={Logo_CEREBRAL} />
          </div>
          <Dropdown>
            <Dropdown.Toggle className='d-flex align-items-center' variant="light" id="dropdown-basic" size="lg">
              <User className='me-2' />
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item className='d-flex align-items-center' onClick={handleShowModalProfile} ><User className='me-2' />Perfil</Dropdown.Item>
              {logged &&
                <>
                  <Dropdown.Divider />
                  <Dropdown.Item className='d-flex align-items-center'><Gear className='me-2' />Editar perfil</Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item className='d-flex align-items-center' onClick={handle_SignOut}><SignOut className='me-2' />Cerrar sesión</Dropdown.Item>
                </>
              }
            </Dropdown.Menu>
          </Dropdown>
        </div>
      }

      <Modal_Profile show={showModalProfile} handleClose={handleCloseModalProfile} handleOpen={handleShowModalProfile} setLogged={setLogged} setStep={setStep} updateSteps={updateSteps} setStepsCompleted={setStepsCompleted} />
    </>
  );
}
