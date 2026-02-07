import React from 'react';
import LoginPage from './pages/LoginPage'; // ดึงไฟล์ Login มาใช้

function App() {
  // สั่งให้โชว์หน้า Login เป็นหน้าแรก
  return (
    <div>
      <LoginPage />
    </div>
  );
}

export default App;