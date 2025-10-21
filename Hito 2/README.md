

### 📌 Biblioteca de Aserciones: Jest

Para los servicios backend de CompraSmart, elegí "Jest" como biblioteca de aserciones porque ofrece una solución completa de pruebas desde el primer momento. Incluye:

- Una sintaxis limpia y expresiva para escribir aserciones (por ejemplo, `expect(valor).toBe(esperado)`)
- Soporte integrado para mocks, pruebas asíncronas y generación de informes de cobertura
- Integración fluida con proyectos Node.js
- Amplio respaldo de la comunidad y documentación sólida

Jest sigue el estilo TDD (Desarrollo guiado por pruebas), lo cual se alinea perfectamente con los objetivos de este proyecto. Me permite validar la lógica de negocio de cada microservicio antes de desplegarlo en la nube.

---

### 📌 Assertion Library: Jest

For the backend services of CompraSmart, I chose "Jest" as the assertion library because it offers a complete testing solution out of the box. It includes:

- A clean and expressive syntax for writing assertions (e.g., `expect(value).toBe(expected)`)
- Built-in support for mocking, asynchronous testing, and coverage reports
- Seamless integration with Node.js projects
- Strong community support and documentation

Jest follows the TDD (Test-Driven Development) style, which aligns well with the goals of this project. It allows me to validate the business logic of each microservice before deploying to the cloud.

### Justificación — 

- **Gestor de tareas:** `npm`, estándar para proyectos Node.js.
- **Librería de aserciones:** `expect()` de Jest, simple y expresiva.
- **Framework de testing:** `Jest` + `Supertest`, ideal para probar rutas de Express y lógica del  backend.
- **Sistema de CI:** GitHub Actions, gratuito e integrado con GitHub. Ejecuta los tests automáticamente en cada push o pull request.
- **Tests implementados:** Cubren registro de usuarios, inicio de sesión, comparación de productos y manejo de errores.



---------------------------------------------------------------------------------------------------


### 📌 Framework de Pruebas: Jest

Para ejecutar las pruebas en los servicios backend de CompraSmart, he elegido Jest como framework de pruebas. Jest actúa como test runner, encontrando y ejecutando automáticamente los archivos de prueba, y mostrando los resultados de forma clara. Las razones de esta elección son:

- Integración directa con Node.js y proyectos JavaScript
- Detección automática de archivos de prueba
- Informes detallados de resultados y cobertura
- Configuración mínima y rápida puesta en marcha

Jest permite mantener una alta calidad del código y facilita la integración continua, ya que se puede ejecutar fácilmente tanto en local como en sistemas CI como GitHub Actions.

---

### 📌 Test Runner: Jest

To run tests in the backend services of CompraSmart, I chose Jest as the test runner. Jest automatically detects and executes test files, and provides clear reporting of results. The reasons for this choice include:

- Direct integration with Node.js and JavaScript projects
- Automatic detection of test files
- Detailed result and coverage reports
- Minimal configuration and fast setup

Jest helps maintain high code quality and supports continuous integration, as it can be easily run both locally and in CI systems like GitHub Actions.


### Justification — 

- **Task runner:** `npm`, standard for Node.js projects.
- **Assertion library:** `expect()` from Jest, simple and expressive.
- **Test framework:** `Jest` + `Supertest`, ideal for testing Express routes and backend logic.
- **CI system:** GitHub Actions, free and integrated with GitHub. Automatically runs tests on every push or pull request.
- **Tests implemented:** Cover user registration, login, product comparison, and error handling.
