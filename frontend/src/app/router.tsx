import { createBrowserRouter, Navigate } from 'react-router';
import { CalendarPage } from '../pages/CalendarPage';
import { CategoriesPage } from '../pages/CategoriesPage';
import { LoginPage } from '../pages/LoginPage';
import { MePage } from '../pages/MePage';
import { SignupPage } from '../pages/SignupPage';
import { TodoFormPage } from '../pages/TodoFormPage';
import { TodoListPage } from '../pages/TodoListPage';
import { AppLayout } from './AppLayout';
import { RequireAuth } from './RequireAuth';

export const router = createBrowserRouter([
  {
    element: <RequireAuth mode="guest" />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/signup', element: <SignupPage /> },
    ],
  },
  {
    element: <RequireAuth mode="authed" />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/todos', element: <TodoListPage /> },
          { path: '/todos/new', element: <TodoFormPage /> },
          { path: '/todos/:id/edit', element: <TodoFormPage /> },
          { path: '/calendar', element: <CalendarPage /> },
          { path: '/categories', element: <CategoriesPage /> },
          { path: '/me', element: <MePage /> },
          { path: '/', element: <Navigate to="/todos" replace /> },
          { path: '*', element: <Navigate to="/todos" replace /> },
        ],
      },
    ],
  },
]);
