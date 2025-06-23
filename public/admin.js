document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.querySelector('#progress-table tbody');
    const loadingMessage = document.getElementById('loading-message');
    const errorMessageDiv = document.getElementById('error-message-admin');
    const refreshBtn = document.getElementById('refresh-btn');

    const currentUser = sessionStorage.getItem('currentUser');
    const userRole = sessionStorage.getItem('userRole');
    const API_URL = `https://curso-mrs.onrender.com/api/admin/all-progress?adminUser=${currentUser}`