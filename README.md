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
    (<code>sum_click</code>) y el historial de intentos previos 
    (<code>num_of_prev_attempts</code>) permiten predecir el riesgo de deserción 
    estudiantil antes de las evaluaciones parciales mediante un pipeline distribuido de Big Data?
  </li>
  <br>
  <li>
    <strong>Métrica de Éxito:</strong>
    Alcanzar un <strong>AUC-ROC &ge; 0.80</strong> (métrica primaria de discriminación) y un 
    <strong>F1-Score &ge; 0.75</strong> en el conjunto de prueba independiente del 20%, 
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
                 ├── Agregación masiva de telemetría
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
  El procesamiento de los datos se realizó mediante <strong>PySpark</strong>, 
  estructurado en seis fases formales:
</p>

<h3>4.1 Agregación masiva de telemetría</h3>
<p>
  Se procesaron de forma distribuida más de <strong>10.6 millones de interacciones</strong>
  del entorno virtual para consolidar la actividad por estudiante y módulo curricular mediante
  <code>groupBy("id_student", "code_module").agg(sum("sum_click"))</code>.
</p>

<h3>4.2 Validación y eliminación de duplicados</h3>
<p>
  Se verificó la integridad de tipos de datos estructurados y se eliminaron tuplas redundantes 
  previo a la consolidación relacional.
</p>

<h3>4.3 Filtrado temporal</h3>
<p>
  Se descartaron 36 registros con inconsistencias operacionales en <code>date_registration</code> 
  fuera del rango válido de <strong>[-150, +30] días</strong> respecto al inicio oficial del curso.
</p>

<h3>4.4 Imputación determinista</h3>
<ul>
  <li><code>0.0</code> para clics ausentes en el aula virtual.</li>
  <li><code>0</code> para intentos previos sin registro de repitencia.</li>
  <li><code>60</code> créditos (mediana institucional) para valores faltantes de carga académica.</li>
</ul>

<h3>4.5 Ingeniería de características</h3>
<p>
  Estandarización de escala numérica con <code>StandardScaler</code> y ensamble de vector denso multivariable 
  con <code>VectorAssembler</code>.
</p>

<h3>4.6 Almacenamiento en Parquet y Cifras de Impacto</h3>
<p>
  Los datos procesados fueron persistidos en el Data Lake en formato columnar <strong>Parquet</strong> y 
  particionados físicamente por <code>code_module</code>.
</p>

<table width="100%" border="1" cellpadding="6" cellspacing="0">
  <thead>
    <tr bgcolor="#f2f2f2">
      <th align="left">Indicador del Pipeline ETL</th>
      <th align="center">Métrica Obtenida</th>
      <th align="left">Impacto Técnico</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Registros iniciales en bruto</td>
      <td align="center">32,593</td>
      <td>Universo inicial consolidado de OULAD</td>
    </tr>
    <tr>
      <td>Registros descartados</td>
      <td align="center">36</td>
      <td>0.11% de anomalías en fechas operacionales</td>
    </tr>
    <tr>
      <td>Registros limpios finales</td>
      <td align="center"><strong>32,557</strong></td>
      <td>100% de consistencia e integridad relacional</td>
    </tr>
    <tr>
      <td>Tamaño en disco (CSV plano vs. Parquet)</td>
      <td align="center"><strong>12.4 MB &rarr; 3.9 MB</strong></td>
      <td><strong>68.5% de reducción de almacenamiento</strong> y optimización en I/O</td>
    </tr>
  </tbody>
</table>

<hr>

<h2> 5. Modelado, Experimentación y Tracking en MLflow</h2>

<p>
  Se compararon tres familias de modelos mediante validación cruzada estratificada de <strong>3 pliegues</strong>, 
  optimización de hiperparámetros con <code>ParamGridBuilder</code> y registro formal de artefactos y métricas 
  en <strong>MLflow Tracking</strong>:
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
      <td align="center"><code>run_01</code></td>
      <td><strong>Logistic Regression</strong></td>
      <td><code>regParam = 0.01</code></td>
      <td align="center"><strong>0.8413</strong></td>
      <td align="center">0.7539</td>
      <td><strong>Seleccionado como modelo óptimo</strong></td>
    </tr>
    <tr>
      <td align="center"><code>run_02</code></td>
      <td>GBT Classifier</td>
      <td><code>maxDepth = 5, maxIter = 20</code></td>
      <td align="center">0.8380</td>
      <td align="center"><strong>0.7728</strong></td>
      <td>Rendimiento competitivo (Mayor latencia de cómputo)</td>
    </tr>
    <tr>
      <td align="center"><code>run_03</code></td>
      <td>Random Forest</td>
      <td><code>numTrees = 100, maxDepth = 8</code></td>
      <td align="center">0.8398</td>
      <td align="center">0.7719</td>
      <td>Robusto ante varianza</td>
    </tr>
  </tbody>
</table>

<h3>Justificación técnica de la selección</h3>
<p>
  <strong>Logistic Regression</strong> fue seleccionado como el modelo final debido a que obtuvo el mayor 
  <strong>AUC-ROC (0.8413)</strong>, definido como la métrica primaria para maximizar la capacidad de discriminación 
  entre desertores y no desertores. Aunque GBT alcanzó un F1-Score ligeramente superior (0.7728), ambos modelos 
  superaron el umbral mínimo exigido (F1 &ge; 0.75). Se priorizó la Regresión Logística por su principio de 
  parsimonia, interpretabilidad directa de coeficientes para auditoría ética y menor costo computacional durante 
  la inferencia distribuida.
</p>

<hr>

<h2> 6. Importancia Relativa de Variables</h2>

<p>
  La importancia relativa de las variables se calculó a partir del valor absoluto de los coeficientes 
  estandarizados ($|\beta_j|$) de la Regresión Logística sobre variables normalizadas, escaladas porcentualmente al 100%:
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
      <td align="center"><strong>77.37%</strong></td>
    </tr>
    <tr>
      <td><code>num_of_prev_attempts</code></td>
      <td>Historial de intentos previos y reprobaciones</td>
      <td align="center"><strong>17.26%</strong></td>
    </tr>
    <tr>
      <td><code>date_registration</code></td>
      <td>Días de antelación o retraso en la matrícula</td>
      <td align="center">3.81%</td>
    </tr>
    <tr>
      <td><code>studied_credits</code></td>
      <td>Carga crediticia total matriculada</td>
      <td align="center">1.56%</td>
    </tr>
  </tbody>
</table>

<blockquote>
  <strong>Conclusión Analítica:</strong> 
  El <strong>94.63%</strong> del poder explicativo global del modelo radica conjuntamente en la telemetría temprana 
  (<code>sum_click</code>) y el historial de repitencia del estudiante (<code>num_of_prev_attempts</code>).
</blockquote>

<hr>

<h2> 7. Detección de Anomalías (TA-4.3)</h2>

<p>
  Mediante el método estadístico <strong>Z-Score</strong> sobre la variable <code>sum_click</code>, se identificaron 
  <strong>599 registros estadísticamente atípicos</strong>, equivalentes al <strong>1.84%</strong> de los 32,557 datos procesados.
</p>

<pre>Criterio de corte: |Z| &gt; 3.0</pre>

<p>
  Estos casos correspondieron a estudiantes con niveles de actividad estadísticamente extremos respecto a la distribución 
  general, los cuales fueron identificados y aislados para evaluar su posible impacto en la estabilidad numérica del modelo 
  sin sesgar el entrenamiento distribuido.
</p>

<hr>

<h2> 8. Gobierno de Datos y Auditoría Ética</h2>

<h3>Calidad de Datos - Marco DAMA (6 Dimensiones)</h3>
<ul>
  <li><strong>Completitud:</strong> 99.8% en variables analíticas tras la imputación determinista.</li>
  <li><strong>Consistencia:</strong> 100% de integridad referencial entre tablas de matrícula y telemetría LMS.</li>
  <li><strong>Validez:</strong> 100% de esquemas tipificados bajo el estándar Parquet.</li>
  <li><strong>Exactitud:</strong> 99.89% tras depurar los 36 registros con fechas operacionales fuera de rango.</li>
  <li><strong>Unicidad:</strong> 100% de perfiles únicos garantizados por la clave compuesta (<code>id_student</code>, <code>code_module</code>).</li>
  <li><strong>Oportunidad:</strong> Telemetría procesada durante las primeras cuatro semanas lectivas, habilitando soporte preventivo.</li>
</ul>

<h3>Cumplimiento de la LOPDP (Ecuador)</h3>
<ul>
  <li><strong>Seudonimización estricta:</strong> Eliminación de identificadores directos (nombres, cédulas, correos), operando únicamente con códigos numéricos artificiales (<code>id_student</code>).</li>
  <li><strong>Principio de finalidad:</strong> Restricción estricta del uso de datos para fines psicopedagógicos y de bienestar estudiantil institucional.</li>
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
      <td>Ponderación multivariable (antecedentes académicos y matrícula) para no catalogar a un alumno como desertor únicamente por baja conectividad en zonas rurales.</td>
    </tr>
    <tr>
      <td><strong>Estigmatización</strong></td>
      <td align="center"><strong>Medio</strong></td>
      <td>Los reportes no se divulgan públicamente; las intervenciones se canalizan de forma confidencial como invitaciones generales a tutorías de apoyo académico.</td>
    </tr>
    <tr>
      <td><strong>Decisiones automatizadas</strong></td>
      <td align="center"><strong>Alto</strong></td>
      <td>El modelo opera como triaje de apoyo preventivo; ninguna sanción o desvinculación administrativa se aplica automáticamente sin previa validación docente presencial.</td>
    </tr>
  </tbody>
</table>

<hr>

<h2> 9. Instrucciones de Reproducibilidad</h2>

<h3>1. Clonar el repositorio</h3>
<pre><code>git clone https://github.com/santiiis/proyectobigdata.git
cd proyectobigdata</code></pre>

<h3>2. Abrir y ejecutar el notebook</h3>
<ol>
  <li>Abrir el archivo <code>notebooks/Proyecto_Final_BigData_Desercion.ipynb</code> en <strong>Google Colab</strong>.</li>
  <li>En el menú superior, seleccionar: <strong>Entorno de ejecución &rarr; Reiniciar y ejecutar todo</strong>.</li>
</ol>

<p>El cuaderno ejecuta de forma secuencial y sin errores el siguiente flujo:</p>

<pre>
Carga e Ingesta OULAD ──> Pipeline ETL PySpark ──> Persistencia Parquet ──> Spark MLlib + MLflow ──> Evaluación y Ética
</pre>

<hr>

<h2> Resumen de Resultados Finales</h2>

<table width="100%" border="1" cellpadding="6" cellspacing="0">
  <thead>
    <tr bgcolor="#f2f2f2">
      <th align="left">Métrica / Componente</th>
      <th align="center">Cifra Real Obtenida</th>
      <th align="left">Conclusión de Negocio</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Registros finales procesados</td>
      <td align="center"><strong>32,557</strong></td>
      <td>Integración completa de perfiles OULAD con 100% de consistencia</td>
    </tr>
    <tr>
      <td>Optimización de almacenamiento</td>
      <td align="center"><strong>68.5%</strong></td>
      <td>Ahorro de espacio y aceleración de consultas con Parquet particionado</td>
    </tr>
    <tr>
      <td>Modelo óptimo seleccionado</td>
      <td align="center"><strong>Logistic Regression</strong></td>
      <td>Mayor capacidad de discriminación con mínima sobrecarga computacional</td>
    </tr>
    <tr>
      <td>AUC-ROC en conjunto de test</td>
      <td align="center"><strong>0.8413</strong></td>
      <td>Supera holgadamente el criterio de éxito (&ge; 0.80)</td>
    </tr>
    <tr>
      <td>F1-Score en conjunto de test</td>
      <td align="center"><strong>0.7539</strong></td>
      <td>Cumple con el estándar mínimo establecido (&ge; 0.75)</td>
    </tr>
    <tr>
      <td>Anomalías detectadas (Z-Score &gt; 3.0)</td>
      <td align="center"><strong>599 (1.84%)</strong></td>
      <td>Identificación y aislamiento de patrones estadísticamente atípicos</td>
    </tr>
    <tr>
      <td>Poder explicativo conjunto (sum_click + repitencia)</td>
      <td align="center"><strong>94.63%</strong></td>
      <td>Confirma que la interacción temprana y los antecedentes definen la deserción</td>
    </tr>
  </tbody>
</table>
