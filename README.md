<h1> Predicción de Deserción Estudiantil - Proyecto Integrador Big Data</h1>

<p>
  <b>Asignatura:</b> Prácticas y Herramientas de Big Data<br>
  <b>Institución:</b> Universidad Internacional del Ecuador (UIDE)<br>
  <b>Docente:</b> Ing. Diego Pinto<br>
  <b>Integrantes:</b> Lander González &amp; Erick Morales<br>
  <b>Tema Asignado:</b> Predicción de Deserción Estudiantil (Grupo 7)<br>
  <b>Repositorio Oficial:</b> <a href="https://github.com/santiiis/proyectobigdata" target="_blank">https://github.com/santiiis/proyectobigdata</a>
</p>

<hr>

<h2> 1. Planteamiento del Problema y Pregunta Analítica</h2>
<p>
  La deserción universitaria temprana compromete la continuidad pedagógica y la sostenibilidad institucional. El seguimiento convencional detecta la desconexión del estudiante de manera reactiva, una vez que las calificaciones finales han sido asentadas.
</p>
<ul>
  <li><b>Pregunta Analítica:</b> ¿En qué medida el volumen de interacción en el entorno virtual LMS (<code>sum_click</code>) y el historial de intentos previos (<code>num_of_prev_attempts</code>) permiten predecir el riesgo de deserción estudiantil antes de las evaluaciones parciales mediante un pipeline distribuido de Big Data?</li>
  <li><b>Métrica de Éxito:</b> Alcanzar un AUC-ROC &ge; 0.80 y un F1-Score &ge; 0.78 en el conjunto de prueba independiente (20%), priorizando la minimización de falsos negativos.</li>
</ul>

<hr>

<h2> 2. Fuentes de Datos y Volumen Masivo</h2>
<p>
  Los datos originales provienen del repositorio público:
  <br>
   <a href="https://www.kaggle.com/datasets/anlgrbz/student-demographics-online-education-dataoulad" target="_blank">Open University Learning Analytics Dataset (OULAD) en Kaggle</a>
</p>
<ul>
  <li><b>32,593 registros de estudiantes:</b> Datos sociodemográficos, académicos y estado final (<code>studentInfo.csv</code> y <code>studentRegistration.csv</code>).</li>
  <li><b>Más de 10.6 millones de interacciones LMS:</b> Telemetría de clics y logs de navegación en el campus virtual (<code>studentVle.csv</code>).</li>
</ul>

<hr>

<h2> 3. Arquitectura de la Solución End-to-End</h2>
<pre>
[ Fuentes CSV / 10.6M Logs OULAD ]
                 │
                 ▼  (Ingesta distribuida)
[ Pipeline ETL en Apache Spark ] ──────> Agregación masiva, Imputación, VectorAssembler
                 │
                 ▼  (Almacenamiento columnar)
[ Data Lake en Parquet ] ──────────────> Particionado por 'code_module' (-68.5% en disco)
                 │
                 ▼  (Entrenamiento optimizado)
[ Spark MLlib + MLflow Tracking ] ─────> CrossValidator (3 pliegues) + ParamGrid
                 │
                 ▼  (Explotación y Alertas)
[ Resultados y Auditoría Ética ] ──────> DAMA, LOPDP y disparador preventivo (> 0.65)
</pre>

<hr>

<h2> 4. Pipeline ETL y Almacenamiento Columnar</h2>
<p>Procesamiento distribuido con PySpark:</p>
<ol>
  <li><b>Agregación masiva de telemetría:</b> Procesamiento y reducción distribuida de los <b>+10.6 millones de clics</b> hacia los 32,593 perfiles únicos consolidados mediante <code>groupBy("id_student", "code_module").sum("sum_click")</code>.</li>
  <li><b>Filtrado temporal:</b> Descarte de inconsistencias en <code>date_registration</code> fuera del rango operacional válido [-150, +30] días respecto al inicio del curso.</li>
  <li><b>Imputación determinista:</b> Asignación de <code>0.0</code> a clics ausentes, <code>0</code> a intentos previos y <code>60</code> créditos (mediana) a la carga académica.</li>
  <li><b>Ingeniería de variables:</b> Normalización con <code>StandardScaler</code> y vectorización densa con <code>VectorAssembler</code>.</li>
  <li><b>Almacenamiento en Parquet:</b> Persistencia física particionada por <code>code_module</code>. Reducción de <b>12.4 MB</b> (CSV) a <b>3.9 MB</b> (Parquet), logrando un <b>68.5% de ahorro en I/O</b>.</li>
</ol>

<hr>

<h2> 5. Modelado, Experimentación y Tracking en MLflow</h2>
<p>Comparación de modelos con validación cruzada (3 pliegues) y registro formal en <b>MLflow</b>:</p>

<table width="100%">
  <thead>
    <tr style="background-color: #f2f2f2;">
      <th>Run ID</th>
      <th>Modelo Evaluado</th>
      <th>Hiperparámetros Clave</th>
      <th>AUC-ROC</th>
      <th>F1-Score</th>
      <th>Veredicto Técnico</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>run_01</code></td>
      <td>Logistic Regression</td>
      <td><code>regParam = 0.01</code></td>
      <td>0.7420</td>
      <td>0.7180</td>
      <td>Descartado (Alto sesgo lineal)</td>
    </tr>
    <tr>
      <td><code>run_02</code></td>
      <td>GBT Classifier</td>
      <td><code>maxDepth = 5, maxIter = 20</code></td>
      <td>0.8115</td>
      <td>0.7930</td>
      <td>Rendimiento competitivo</td>
    </tr>
    <tr style="font-weight: bold; background-color: #e6f3ff;">
      <td><code>run_03</code></td>
      <td>Random Forest (Óptimo)</td>
      <td><code>numTrees = 100, maxDepth = 8</code></td>
      <td>0.8412</td>
      <td>0.8145</td>
      <td>Seleccionado como modelo final</td>
    </tr>
  </tbody>
</table>

<h3>Importancia Relativa de Variables (Feature Importance)</h3>
<ul>
  <li><b>Telemetría acumulada en campus virtual (<code>sum_click</code>):</b> 46.8%</li>
  <li><b>Intentos previos de repetición (<code>num_of_prev_attempts</code>):</b> 24.1%</li>
  <li><b>Antelación de matrícula (<code>date_registration</code>):</b> 18.5%</li>
  <li><b>Créditos matriculados (<code>studied_credits</code>):</b> 10.6%</li>
</ul>
<blockquote>
  <b>Conclusión Analítica:</b> El <b>70.9%</b> del poder predictivo del abandono radica en la interacción temprana y los antecedentes de repitencia del estudiante.
</blockquote>

<hr>

<h2> 6. Gobierno de Datos y Auditoría Ética</h2>
<ul>
  <li><b>Calidad DAMA:</b> 99.8% de completitud tras el tratamiento ETL y 100% de consistencia relacional en <code>id_student</code>.</li>
  <li><b>Cumplimiento LOPDP (Ecuador):</b> Seudonimización estricta de identificadores y aplicación del principio de finalidad exclusiva para apoyo pedagógico institucional.</li>
  <li><b>Mitigación de Sesgos:</b> Ponderación multivariable para evitar catalogar a un estudiante como desertor únicamente por baja conectividad a internet en zonas rurales.</li>
</ul>



<h2> 7. Instrucciones de Reproducibilidad</h2>
<ol>
  <li>
    Clonar el repositorio:
    <pre><code>git clone https://github.com/santiiis/proyectobigdata.git
cd proyectobigdata</code></pre>
  </li>
  <li>
    Abrir el notebook <code>notebooks/Proyecto_Final_BigData_Desercion.ipynb</code> en <b>Google Colab</b>.
  </li>
  <li>
    En el menú superior, seleccionar: <b>Entorno de ejecución &rarr; Reiniciar y ejecutar todo</b>.
  </li>
</ol>
