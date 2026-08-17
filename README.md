<h1> Predicción de Deserción Estudiantil - Proyecto Integrador Big Data</h1>

<p>
  <strong>Asignatura:</strong> Prácticas y Herramientas de Big Data<br>
  <strong>Institución:</strong> Universidad Internacional del Ecuador (UIDE)<br>
  <strong>Docente:</strong> Ing. Diego Pinto<br>
  <strong>Integrantes:</strong> Lander González &amp; Erick Morales<br>
  <strong>Tema Asignado:</strong> Predicción de Deserción Estudiantil (Grupo 7)<br>
  <strong>Repositorio Oficial:</strong> <a href="https://github.com/santiiis/proyectobigdata" target="_blank">https://github.com/santiiis/proyectobigdata</a>
</p>

<hr>

<h2> 1. Planteamiento del Problema y Pregunta Analítica</h2>

<p>
  La deserción universitaria temprana compromete la continuidad pedagógica y la sostenibilidad institucional. 
  El seguimiento convencional detecta la desconexión del estudiante de manera reactiva, una vez que las 
  calificaciones finales han sido asentadas.
</p>

<ul>
  <li>
    <strong>Pregunta Analítica:</strong>
    ¿En qué medida el volumen de interacción en el entorno virtual LMS 
    (<code>sum_click</code>) y los antecedentes académicos permiten predecir el riesgo de deserción 
    estudiantil antes de las evaluaciones parciales mediante un pipeline distribuido de Big Data?
  </li>
  <br>
  <li>
    <strong>Métrica de Éxito:</strong>
    Alcanzar un <strong>AUC-ROC &ge; 0.80</strong> (métrica primaria de discriminación) y un 
    <strong>F1-Score &ge; 0.75</strong> en el conjunto de prueba independiente, 
    priorizando la minimización de falsos negativos.
  </li>
</ul>

<hr>

<h2> 2. Fuentes de Datos y Volumen Masivo</h2>

<p>
  Los datos originales provienen del repositorio público en Kaggle:
  <br>
   <a href="https://www.kaggle.com/datasets/anlgrbz/student-demographics-online-education-dataoulad" target="_blank"><strong>Open University Learning Analytics Dataset (OULAD) en Kaggle</strong></a>
</p>

<ul>
  <li>
    <strong>32,593 registros de estudiantes:</strong>
    Datos sociodemográficos, académicos y estado final obtenidos de 
    <code>studentInfo.csv</code> y <code>studentRegistration.csv</code>.
  </li>
  <br>
  <li>
    <strong>Más de 10.6 millones de interacciones LMS:</strong>
    Telemetría de clics y logs de navegación en el campus virtual obtenidos de 
    <code>studentVle.csv</code>.
  </li>
</ul>

<hr>

<h2> 3. Arquitectura de la Solución End-to-End</h2>

<pre>
[ Fuentes CSV / 10.6M Logs OULAD (Kaggle) ]
                 │
                 ▼
        Ingesta distribuida
                 │
                 ▼
[ Pipeline ETL en Apache Spark (PySpark) ]
                 │
                 ├── Agregación masiva de telemetría (+10.6M logs)
                 ├── Validación y eliminación de duplicados
                 ├── Filtrado temporal [-150, +30] días
                 ├── Imputación determinista de nulos
                 └── Ingeniería de características (StandardScaler + VectorAssembler)
                 │
                 ▼
      Almacenamiento columnar
                 │
                 ▼
[ Data Lake en Parquet ]
                 │
                 ├── Particionado por code_module
                 └── Reducción del 68.5% en almacenamiento
                 │
                 ▼
   Entrenamiento y experimentación
                 │
                 ▼
[ Spark MLlib + MLflow Tracking ]
                 │
                 ├── CrossValidator (3 pliegues)
                 ├── ParamGridBuilder
                 └── Evaluación de 3 familias algorítmicas
                 │
                 ▼
[ Resultados y Auditoría Ética ]
                 │
                 ├── Calidad DAMA (6 dimensiones)
                 ├── Cumplimiento LOPDP (Ecuador)
                 └── Matriz de 3 riesgos y mitigaciones
</pre>

<hr>

<h2> 4. Pipeline ETL y Almacenamiento Columnar</h2>

<p>
  El procesamiento distribuido en <strong>PySpark</strong> consolidó los datos en seis fases:
</p>

<ol>
  <li><strong>Agregación masiva:</strong> Reducción de más de 10.6 millones de logs de clics hacia registros consolidados con <code>groupBy("id_student", "code_module").agg(sum("sum_click"))</code>.</li>
  <li><strong>Validación de esquemas:</strong> Tipificación estructurada y eliminación de tuplas duplicadas.</li>
  <li><strong>Filtrado temporal y consistencia:</strong> Depuración de registros fuera del rango operacional de matrícula.</li>
  <li><strong>Imputación determinista:</strong> Asignación de <code>0.0</code> a clics ausentes, <code>0</code> a intentos previos y <code>60</code> créditos (mediana) a la carga académica.</li>
  <li><strong>Ingeniería de variables:</strong> Normalización con <code>StandardScaler</code> y vectorización con <code>VectorAssembler</code>.</li>
  <li><strong>Persistencia en Parquet:</strong> Almacenamiento particionado por <code>code_module</code>, reduciendo el tamaño en disco de <strong>12.4 MB (CSV) a 3.9 MB (Parquet)</strong> (<strong>68.5% de ahorro</strong>).</li>
</ol>

<table width="100%" border="1" cellpadding="6" cellspacing="0">
  <thead>
    <tr bgcolor="#f2f2f2">
      <th align="left">Indicador del Dataset</th>
      <th align="center">Registros</th>
      <th align="left">Detalle Operacional</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Registros finales tras filtrado ETL</td>
      <td align="center"><strong>30,365</strong></td>
      <td>100% de consistencia relacional</td>
    </tr>
    <tr>
      <td>Partición de Entrenamiento (Train)</td>
      <td align="center">24,336</td>
      <td>80% de los datos para Cross-Validation</td>
    </tr>
    <tr>
      <td>Partición de Prueba (Test)</td>
      <td align="center">6,029</td>
      <td>20% conjunto de evaluación independiente</td>
    </tr>
  </tbody>
</table>

<hr>

<h2> 5. Modelado, Experimentación y Tracking en MLflow</h2>

<p>
  Se evaluaron tres familias de modelos mediante <strong>CrossValidator (3 pliegues)</strong> y 
  <strong>ParamGridBuilder</strong>, registrando parámetros y métricas en <strong>MLflow</strong>:
</p>

<table width="100%" border="1" cellpadding="6" cellspacing="0">
  <thead>
    <tr bgcolor="#f2f2f2">
      <th align="center">Run ID</th>
      <th align="left">Modelo Evaluado</th>
      <th align="left">Hiperparámetros Clave</th>
      <th align="center">AUC-ROC</th>
      <th align="center">F1-Score</th>
      <th align="left">Veredicto Técnico</th>
    </tr>
  </thead>
  <tbody>
    <tr bgcolor="#e6f3ff">
      <td align="center"><code>run_02</code></td>
      <td><strong>GBT Classifier (Óptimo)</strong></td>
      <td><code>maxDepth = 5, maxIter = 20</code></td>
      <td align="center"><strong>0.8515</strong></td>
      <td align="center"><strong>0.7935</strong></td>
      <td><strong>Seleccionado como mejor modelo</strong></td>
    </tr>
    <tr>
      <td align="center"><code>run_01</code></td>
      <td>Logistic Regression</td>
      <td><code>regParam = 0.01</code></td>
      <td align="center">0.8394</td>
      <td align="center">0.7791</td>
      <td>Rendimiento competitivo</td>
    </tr>
    <tr>
      <td align="center"><code>run_03</code></td>
      <td>Random Forest</td>
      <td><code>numTrees = 100, maxDepth = 8</code></td>
      <td align="center">0.8379</td>
      <td align="center">0.7948</td>
      <td>Alto F1, menor AUC</td>
    </tr>
  </tbody>
</table>

<h3>Justificación técnica de la selección</h3>
<p>
  <strong>GBT Classifier</strong> fue seleccionado como el modelo óptimo al alcanzar el mayor 
  <strong>AUC-ROC (0.8515)</strong> y un <strong>F1-Score de 0.7935</strong> en el conjunto de prueba independiente (6,029 registros). 
  El algoritmo de Gradient Boosting captura relaciones complejas y no lineales entre los patrones de navegación y la carga crediticia, superando en capacidad discriminante a Random Forest y a la Regresión Logística.
</p>

<hr>

<h2> 6. Importancia Relativa de Variables</h2>

<p>
  Importancia de características extraída del modelo óptimo <strong>GBT Classifier</strong>:
</p>

<table width="100%" border="1" cellpadding="6" cellspacing="0">
  <thead>
    <tr bgcolor="#f2f2f2">
      <th align="left">Variable</th>
      <th align="left">Descripción Académica</th>
      <th align="center">Importancia Relativa</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>sum_click</code></td>
      <td>Telemetría acumulada de interacción en aula virtual</td>
      <td align="center"><strong>74.53%</strong></td>
    </tr>
    <tr>
      <td><code>studied_credits</code></td>
      <td>Carga crediticia total matriculada</td>
      <td align="center"><strong>12.52%</strong></td>
    </tr>
    <tr>
      <td><code>date_registration</code></td>
      <td>Días de antelación o retraso en la matrícula</td>
      <td align="center">9.51%</td>
    </tr>
    <tr>
      <td><code>num_of_prev_attempts</code></td>
      <td>Historial de intentos previos y reprobaciones</td>
      <td align="center">3.44%</td>
    </tr>
  </tbody>
</table>

<blockquote>
  <strong>Conclusión Analítica:</strong> 
  El <strong>74.53%</strong> del poder explicativo del modelo reside en el volumen de interacción en el LMS (<code>sum_click</code>), complementado por la carga crediticia matriculada (<strong>12.52%</strong>).
</blockquote>

<hr>

<h2> 7. Detección de Anomalías (TA-4.3)</h2>

<p>
  Mediante el método estadístico <strong>Z-Score</strong> sobre la variable <code>sum_click</code> ($|Z| > 3.0$), se identificaron 
  <strong>616 registros estadísticamente atípicos</strong>, correspondientes al <strong>2.03%</strong> de los 30,365 datos limpios.
</p>
<p>
  Estos casos correspondieron a estudiantes con niveles de actividad estadísticamente extremos respecto a la distribución general, los cuales fueron identificados y aislados para evaluar su posible impacto en la estabilidad numérica del modelo sin alterar el entrenamiento.
</p>

<hr>

<h2> 8. Gobierno de Datos y Auditoría Ética</h2>

<h3>Calidad de Datos - Marco DAMA (6 Dimensiones)</h3>
<ul>
  <li><strong>Completitud:</strong> 99.8% tras imputación determinista de nulos.</li>
  <li><strong>Consistencia:</strong> 100% de integridad referencial entre tablas de matrícula y telemetría LMS.</li>
  <li><strong>Validez:</strong> 100% de esquemas tipificados bajo el estándar Parquet.</li>
  <li><strong>Exactitud:</strong> Depuración de registros fuera del rango operacional de matrícula.</li>
  <li><strong>Unicidad:</strong> 100% de perfiles únicos garantizados por clave compuesta (<code>id_student</code>, <code>code_module</code>).</li>
  <li><strong>Oportunidad:</strong> Telemetría procesada dentro de las primeras cuatro semanas lectivas.</li>
</ul>

<h3>Cumplimiento de la LOPDP (Ecuador)</h3>
<ul>
  <li><strong>Seudonimización:</strong> Uso exclusivo de identificadores numéricos artificiales (<code>id_student</code>).</li>
  <li><strong>Principio de finalidad:</strong> Uso exclusivo para soporte psicopedagógico y bienestar estudiantil.</li>
</ul>

<h3>Matriz de Riesgos Éticos y Mitigaciones</h3>

<table width="100%" border="1" cellpadding="6" cellspacing="0">
  <thead>
    <tr bgcolor="#f2f2f2">
      <th align="left">Riesgo Identificado</th>
      <th align="center">Nivel</th>
      <th align="left">Medida de Mitigación Implementada</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Brecha digital</strong></td>
      <td align="center"><strong>Alto</strong></td>
      <td>Ponderación multivariable que evalúa créditos y matrícula para no penalizar a estudiantes con baja conectividad en zonas rurales.</td>
    </tr>
    <tr>
      <td><strong>Estigmatización</strong></td>
      <td align="center"><strong>Medio</strong></td>
      <td>Reportes confidenciales canalizados como invitaciones abiertas a tutorías académicas.</td>
    </tr>
    <tr>
      <td><strong>Decisiones automatizadas</strong></td>
      <td align="center"><strong>Alto</strong></td>
      <td>El modelo opera como triaje preventivo; ninguna sanción o baja administrativa se ejecuta sin validación docente presencial.</td>
    </tr>
  </tbody>
</table>

<hr>

<h2> 9. Instrucciones de Reproducibilidad</h2>

<ol>
  <li>Clonar el repositorio:
    <pre><code>git clone https://github.com/santiiis/proyectobigdata.git
cd proyectobigdata</code></pre>
  </li>
  <li>Abrir el notebook <code>notebooks/Proyecto_Final_BigData_Desercion.ipynb</code> en <strong>Google Colab</strong>.</li>
  <li>Seleccionar: <strong>Entorno de ejecución &rarr; Reiniciar y ejecutar todo</strong>.</li>
</ol>
