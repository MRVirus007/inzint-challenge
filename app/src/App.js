import './App.css';
import { UploadVideo } from './service/api';
import { useState } from 'react';
function App() {
  const [file, setFile] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('video', file);
    try {
      //upload video then get status if video uploaded
      await UploadVideo(formData);
      alert('Video upload successful!');
      setFile(null);
    } catch (error) {
      console.error(error);
      alert('Video upload failed!');
    }
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };
  return (
    <div className="App">
      <header className="App-header">
        <h5>Upload a Video to S3</h5>
        <form onSubmit={handleSubmit}>
          <input type="file" accept='video/*' name="video" onChange={handleFileChange} />
          <button type="submit">Upload</button>
        </form>
      </header>
    </div>
  );
}

export default App;
