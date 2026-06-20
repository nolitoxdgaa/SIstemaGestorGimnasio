# 🏋️ OLYMPUS CORE — Sistema Gestor de Gimnasio

Sistema integral de gestión y autogestión para el gimnasio OLYMPUS CORE.  
Proyecto académico — Ingeniería de Requisitos, UNMSM 2026.

---

## 📋 Requisitos previos (instalar una sola vez)

- [Node.js v20+](https://nodejs.org/) ← **OBLIGATORIO, instalar primero**
- [Git](https://git-scm.com/)
- Acceso a una base de datos PostgreSQL (ver sección BD)

---

## 🚀 Instalación rápida

### 1. Clonar el repositorio
```bash
git clone <url-del-repo>
cd SIstemaGestorGimnasio
```

### 2. Configurar el backend
```bash
cd backend
npm install
cp .env.example .env
# Editar .env con tus credenciales de BD y JWT_SECRET
npm run dev
```

El servidor estará disponible en: `http://localhost:3001`  
Health check: `http://localhost:3001/api/v1/health`

### 3. Configurar el frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

La app estará disponible en: `http://localhost:5173`

---

## 🗄️ Base de datos

Para el MVP1 usaremos una alternativa gratuita en la nube:

**Opción recomendada: [Neon.tech](https://neon.tech)** (PostgreSQL serverless gratuito)
1. Crear cuenta en neon.tech
2. Crear un proyecto nuevo
3. Copiar la `DATABASE_URL` que te dan
4. Pegarla en `backend/.env`
5. Ejecutar el schema: `database/schema.sql`

**Opción alternativa: [Supabase](https://supabase.com)** (también gratuito)

---

## 📁 Estructura del proyecto

```
SIstemaGestorGimnasio/
├── backend/          Node.js + Express (API REST)
├── frontend/         React + Tailwind CSS
├── database/         Schema SQL y migraciones
├── API_CONTRACT.md   Contrato de API (leer obligatoriamente)
└── README.md
```

---

## 👥 Integrantes y módulos

| Integrante | Código | Módulos |
|---|---|---|
| Alva Chacon, Jose Benjamin | 24200045 | Backend core: Auth, Socios, Membresías, Pagos, Acceso QR, Dashboard |
| Cordova Guerra, Josue Rodrigo | 24200155 | Backend operativo: Clases, Reservas, Penalizaciones |
| Sandoval Dominguez, Erick Marco | 24200172 | Frontend Admin: Login, Dashboard, Socios, Pagos, Acceso QR |
| Melendez Bustamante, Alvaro Mathias | 24200166 | Frontend Socio: Clases, Reservas, Mi Perfil |

---

## 📖 Documentación

- `API_CONTRACT.md` — Endpoints, formatos JSON, códigos de error
- `Documentacion/` — PDFs de requisitos del curso

---

## 🌿 Flujo de trabajo Git

```bash
# Crear rama para tu módulo
git checkout -b feature/nombre-modulo

# Trabajar, hacer commits frecuentes
git add .
git commit -m "feat: descripción del cambio"

# Subir cambios
git push origin feature/nombre-modulo

# Crear Pull Request en GitHub para mergear a main
```

**Nunca hacer push directo a `main`.**
