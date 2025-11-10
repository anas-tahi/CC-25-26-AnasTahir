# Hito 2
##  Versión en Español

###  Biblioteca de Aserciones:Jest

Para los servicios backend de CompraSmart, elegí **Jest** como biblioteca de aserciones porque ofrece una solución completa de pruebas desde el primer momento. Sus ventajas incluyen:

- Sintaxis limpia y expresiva para escribir aserciones (por ejemplo, `expect(valor).toBe(esperado)`)
- Soporte integrado para mocks, pruebas asíncronas y generación de informes de cobertura
- Integración fluida con proyectos Node.js
- Amplio respaldo de la comunidad y documentación sólida

Jest sigue el enfoque TDD (Desarrollo Guiado por Pruebas), lo cual se alinea perfectamente con los objetivos del proyecto. Me permite validar la lógica de negocio de cada microservicio antes de desplegarlo en la nube.

---

###  Framework de Pruebas:Jest

Como framework de pruebas, Jest actúa como test runner: detecta y ejecuta automáticamente los archivos de prueba, mostrando los resultados de forma clara. Las razones de esta elección son:

- Integración directa con Node.js y proyectos JavaScript
- Detección automática de archivos de prueba
- Informes detallados de resultados y cobertura
- Configuración mínima y rápida puesta en marcha

Jest facilita el mantenimiento de una alta calidad del código y se adapta perfectamente a la integración continua, tanto en local como en sistemas CI como GitHub Actions.

---

###  Justificación Técnica

- **Gestor de tareas:** `npm`, estándar para proyectos Node.js
- **Librería de aserciones:** `expect()` de Jest, simple y expresiva
- **Framework de testing:** `Jest` + `Supertest`, ideal para probar rutas de Express y lógica del backend
- **Sistema de CI:** GitHub Actions, gratuito e integrado con GitHub. Ejecuta los tests automáticamente en cada push o pull request
- **Tests implementados:** Cubren registro de usuarios, inicio de sesión, comparación de productos y manejo de errores

----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

##  English Version

###  Assertion Library:Jest

For the backend services of CompraSmart, I chose **Jest** as the assertion library because it provides a complete testing solution out of the box. Key benefits include:

- Clean and expressive syntax for writing assertions (e.g., `expect(value).toBe(expected)`)
- Built-in support for mocking, asynchronous testing, and coverage reports
- Seamless integration with Node.js projects
- Strong community support and solid documentation

Jest follows the TDD (Test-Driven Development) approach, which aligns perfectly with the goals of this project. It allows me to validate the business logic of each microservice before deploying it to the cloud.

---

###  Test Framework:Jest

As a test runner, Jest automatically detects and executes test files, providing clear and detailed results. Reasons for choosing Jest include:

- Direct integration with Node.js and JavaScript projects
- Automatic detection of test files
- Detailed result and coverage reports
- Minimal configuration and fast setup

Jest helps maintain high code quality and supports continuous integration, both locally and through CI systems like GitHub Actions.

---

###  Technical Justification

- **Task manager:** `npm`, standard for Node.js projects
- **Assertion library:** Jest’s `expect()`, simple and expressive
- **Testing framework:** `Jest` + `Supertest`, ideal for testing Express routes and backend logic
- **CI system:** GitHub Actions, free and integrated with GitHub. Automatically runs tests on every push or pull request
- **Implemented tests:** Cover user registration, login, product comparison, and error handling
