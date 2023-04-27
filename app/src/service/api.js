import axios from 'axios';
export async function UploadVideo(formData) {
    return axios.post('http://localhost:5000/api/upload-video', formData);
}