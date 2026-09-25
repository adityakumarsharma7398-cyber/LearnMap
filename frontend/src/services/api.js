import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token automatically if stored
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('learnmap_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.access_token) {
      localStorage.setItem('learnmap_token', res.data.access_token);
      localStorage.setItem('learnmap_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },
  register: async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    if (res.data.access_token) {
      localStorage.setItem('learnmap_token', res.data.access_token);
      localStorage.setItem('learnmap_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
  logout: () => {
    localStorage.removeItem('learnmap_token');
    localStorage.removeItem('learnmap_user');
  },
  getUser: () => {
    try {
      const u = localStorage.getItem('learnmap_user');
      return u ? JSON.parse(u) : { name: 'Demo Student', email: 'demo@learnmap.ai' };
    } catch {
      return { name: 'Demo Student', email: 'demo@learnmap.ai' };
    }
  }
};

export const courseService = {
  getCourses: async () => {
    const res = await api.get('/courses');
    return res.data;
  },
  getCourse: async (id) => {
    const res = await api.get(`/courses/${id}`);
    return res.data;
  },
  createCourse: async (courseData) => {
    const res = await api.post('/courses', courseData);
    return res.data;
  },
};

export const materialService = {
  uploadMaterial: async (courseId, formData) => {
    const res = await api.post(`/courses/${courseId}/materials`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },
  getMaterials: async (courseId) => {
    const res = await api.get(`/courses/${courseId}/materials`);
    return res.data;
  },
};

export const conceptService = {
  getCourseConcepts: async (courseId) => {
    const res = await api.get(`/courses/${courseId}/concepts`);
    return res.data;
  },
  getConceptDetail: async (conceptId) => {
    const res = await api.get(`/concepts/${conceptId}`);
    return res.data;
  },
  getLearnMap: async (courseId) => {
    const res = await api.get(`/courses/${courseId}/map`);
    return res.data;
  },
};

export const practiceService = {
  getQuestions: async (conceptId) => {
    const res = await api.get(`/concepts/${conceptId}/questions`);
    return res.data;
  },
  submitPractice: async (conceptId, answers) => {
    const res = await api.post(`/concepts/${conceptId}/practice`, {
      concept_id: conceptId,
      answers,
    });
    return res.data;
  },
};

export const progressService = {
  getProgress: async (courseId) => {
    const res = await api.get(`/courses/${courseId}/progress`);
    return res.data;
  },
  getWeaknesses: async (courseId) => {
    const res = await api.get(`/courses/${courseId}/weaknesses`);
    return res.data;
  },
  getNextRecommendation: async (courseId) => {
    const res = await api.get(`/courses/${courseId}/recommendations/next`);
    return res.data;
  },
};

export const demoService = {
  resetDemoSeed: async () => {
    const res = await api.post('/demo/reset-seed');
    if (res.data?.course_id) {
      setStoredCourseId(res.data.course_id);
    }
    return res.data;
  },
};

export const getStoredCourseId = () => {
  try {
    return localStorage.getItem('learnmap_current_course_id') || null;
  } catch {
    return null;
  }
};

export const setStoredCourseId = (courseId) => {
  try {
    if (courseId) {
      localStorage.setItem('learnmap_current_course_id', courseId);
    } else {
      localStorage.removeItem('learnmap_current_course_id');
    }
  } catch {
    // Ignore localStorage errors
  }
};

export default api;
