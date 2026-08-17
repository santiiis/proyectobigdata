<h1>Predicción de Deserción Estudiantil - Proyecto Integrador Big Data</h1>

<p>
  <b>Asignatura:</b> Prácticas y Herramientas de Big Data<br>
  <b>Institución:</b> Universidad Internacional del Ecuador (UIDE)<br>
  <b>Docente:</b> Ing. Diego Pinto<br>
  <b>Integrantes:</b> Lander González &amp; Erick Morales<br>
  <b>Tema Asignado:</b> Predicción de Deserción Estudiantil (Grupo 7)<br>
  <b>Repositorio Oficial:</b>
  <a href="https://github.com/santiiis/proyectobigdata" target="_blank">
    https://github.com/santiiis/proyectobigdata
  </a>
</p>

<hr>

<h2>1. Planteamiento del Problema y Pregunta Analítica</h2>

<p>
  La deserción universitaria temprana compromete la continuidad pedagógica y la
  sostenibilidad institucional. El seguimiento convencional detecta la desconexión
  del estudiante de manera reactiva, una vez que las calificaciones finales han
  sido asentadas.
</p>

<ul>
  <li>
    <b>Pregunta Analítica:</b>
    ¿En qué medida el volumen de interacción en el entorno virtual LMS
    (<code>sum_click</code>) y el historial de intentos previos
    (<code>num_of_prev_attempts</code>) permiten predecir el riesgo de deserción
    estudiantil antes de las evaluaciones parciales mediante un pipeline distribuido
    de Big Data?
  </li>

  <li>
    <b>Métrica de Éxito:</b>
    Alcanzar un AUC-ROC &ge; 0.80 y un F1-Score &ge; 0.75 en el conjunto de prueba
    independiente (20%), priorizando la minimización de falsos negativos.
  </li>
</ul>

<hr>

<h2>2. Fuentes de Datos y Volumen Masivo</h2>

<p>
  Los datos originales provienen del repositorio público:
  <br>
  <a href="https://www.kaggle.com/datasets/anlgrbz/student-demographics-online-education-dataoulad"
     target="_blank">
    Open University Learning Analytics Dataset (OULAD) en Kaggle
  </a>
</p>

<ul>
  <li>
    <b>32,593 registros de estudiantes:</b>
    Datos sociodemográficos, académicos y estado final
    (<code>studentInfo.csv</code> y <code>studentRegistration.csv</code>).
  </li>

  <li>
    <b>Más de 10.6 millones de interacciones LMS:</b>
    Telemetría de clics y logs de navegación en el campus virtual
    (<code>studentVle.csv</code>).
  </li>
</ul>

<hr>

<h2>3. Arquitectura de la Solución End-to-End</h2>

<pre>
[ Fuentes CSV / 10.6M Logs OULAD ]
                 │
                 ▼  (Ingesta distribuida)
[ Pipeline ETL en Apache Spark ]
        │
        ├── Agregación masiva
        ├── Validación de datos
        ├── Filtrado temporal
        ├── Imputación
        └── Ingeniería de características
                 │
                 ▼  (Almacenamiento columnar)
[ Data Lake en Parquet ]
        │
        └── Particionado por 'code_module'
            Reducción del 68.5% en almacenamiento
                 │
                 ▼  (Entrenamiento y experimentación)
[ Spark MLlib + MLflow Tracking ]
        │
        └── CrossValidator (3 pliegues) + ParamGrid
                 │
                 ▼
[ Resultados y Auditoría Ética ]
        │
        └── DAMA, LOPDP y alertas preventivas
</pre>

<hr>

<h2>4. Pipeline ETL y Almacenamiento Columnar</h2>

<p>Procesamiento distribuido con PySpark:</p>

<ol>
  <li>
    <b>Agregación masiva de telemetría:</b>
    Procesamiento distribuido de más de <b>10.6 millones de interacciones</b>
    para consolidar la actividad de los estudiantes mediante operaciones
    de agregación en Spark.
  </li>

  <li>
    <b>Validación y eliminación de duplicados:</b>
    Verificación de la integridad de los registros y eliminación de datos
    duplicados o inconsistentes antes del procesamiento final.
  </li>

  <li>
    <b>Filtrado temporal:</b>
    Descarte de inconsistencias en <code>date_registration</code> fuera del
    rango operacional válido [-150, +30] días respecto al inicio del curso.
  </li>

  <li>
    <b>Imputación determinista:</b>
    Asignación de <code>0.0</code> a clics ausentes,
    <code>0</code> a intentos previos y <code>60</code> créditos
    a valores faltantes de carga académica.
  </li>

  <li>
    <b>Generación de la variable objetivo e ingeniería de características:</b>
    Preparación de las variables para el modelado mediante
    <code>VectorAssembler</code> y normalización con
    <code>StandardScaler</code>.
  </li>

  <li>
    <b>Almacenamiento en Parquet:</b>
    Persistencia física particionada por <code>code_module</code>.
    Se logró una reducción de <b>12.4 MB</b> en CSV a <b>3.9 MB</b>
    en Parquet, equivalente a un <b>68.5% de optimización de almacenamiento</b>.
  </li>
</ol>

<p>
  <b>Impacto del ETL:</b>
  De los 32,593 registros iniciales, se descartaron 36 registros inconsistentes,
  obteniendo un conjunto final de <b>32,557 registros procesados</b>.
</p>

<hr>

<h2>5. Modelado, Experimentación y Tracking en MLflow</h2>

<p>
  Se compararon tres modelos mediante validación cruzada de 3 pliegues,
  optimización de hiperparámetros con <code>ParamGrid</code> y registro
  de experimentos en <b>MLflow</b>.
</p>

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

    <tr style="font-weight: bold; background-color: #e6f3ff;">
      <td><code>run_01</code></td>
      <td>Logistic Regression</td>
      <td><code>regParam = 0.01</code></td>
      <td>0.8413</td>
      <td>0.7539</td>
      <td>Seleccionado como modelo final</td>
    </tr>

    <tr>
      <td><code>run_02</code></td>
      <td>GBT Classifier</td>
      <td><code>maxDepth = 5, maxIter = 20</code></td>
      <td>0.8380</td>
      <td>0.7728</td>
      <td>Rendimiento competitivo</td>
    </tr>

    <tr>
      <td><code>run_03</code></td>
      <td>Random Forest</td>
      <td><code>numTrees = 100, maxDepth = 8</code></td>
      <td>0.8398</td>
      <td>0.7719</td>
      <td>Rendimiento competitivo</td>
    </tr>

  </tbody>
</table>

<p>
  <b>Justificación técnica:</b>
  Logistic Regression fue seleccionado como modelo final debido a que obtuvo
  el mayor AUC-ROC (<b>0.8413</b>), métrica primaria definida para el proyecto,
  y además cumplió el F1-Score mínimo establecido de 0.75. Aunque GBT obtuvo
  un F1-Score ligeramente superior, Logistic Regression ofreció la mejor
  capacidad global de discriminación, además de una mayor interpretabilidad
  y eficiencia computacional.
</p>

<h3>Importancia Relativa de Variables</h3>

<p>
  La importancia relativa de las variables se estimó a partir del valor absoluto
  de los coeficientes estandarizados del modelo de Regresión Logística,
  normalizados porcentualmente respecto a la suma total.
</p>

<ul>
  <li>
    <b>Telemetría acumulada en campus virtual
    (<code>sum_click</code>):</b> 77.37%
  </li>

  <li>
    <b>Intentos previos de repetición
    (<code>num_of_prev_attempts</code>):</b> 17.26%
  </li>

  <li>
    <b>Antelación de matrícula
    (<code>date_registration</code>):</b> 3.81%
  </li>

  <li>
    <b>Créditos matriculados
    (<code>studied_credits</code>):</b> 1.56%
  </li>
</ul>

<blockquote>
  <b>Conclusión Analítica:</b>
  El <b>94.63%</b> de la importancia relativa se concentra en la telemetría
  temprana (<code>sum_click</code>) y el historial de intentos previos
  (<code>num_of_prev_attempts</code>).
</blockquote>

<h3>Detección de Anomalías</h3>

<p>
  Se identificaron <b>599 registros estadísticamente atípicos (1.84%)</b>
  mediante el método Z-Score utilizando el criterio <code>|Z| &gt; 3.0</code>.
  Estos registros fueron aislados para evaluar su posible impacto en la
  estabilidad del modelo y evitar distorsiones en el análisis.
</p>

<hr>

<h2>6. Gobierno de Datos y Auditoría Ética</h2>

<ul>
  <li>
    <b>Calidad DAMA:</b>
    Se evaluaron dimensiones como completitud, consistencia, validez,
    exactitud, unicidad y oportunidad de los datos.
  </li>

  <li>
    <b>Completitud e integridad:</b>
    Se alcanzó un 99.8% de completitud tras el tratamiento ETL y
    100% de consistencia relacional en los identificadores procesados.
  </li>

  <li>
    <b>Cumplimiento LOPDP (Ecuador):</b>
    Se aplicó la seudonimización de identificadores y el principio de
    finalidad para limitar el uso de los datos al apoyo pedagógico preventivo.
  </li>

  <li>
    <b>Riesgo de brecha digital:</b>
    Se evita depender únicamente del nivel de clics para no penalizar
    a estudiantes con conectividad limitada.
  </li>

  <li>
    <b>Riesgo de estigmatización:</b>
    Las predicciones funcionan como alertas preventivas y no como
    etiquetas definitivas sobre el estudiante.
  </li>

  <li>
    <b>Riesgo de decisiones automatizadas incorrectas:</b>
    El modelo no toma decisiones académicas automáticas; los resultados
    deben ser revisados por personal académico antes de aplicar
    cualquier intervención.
  </li>
</ul>

<hr>

<h2>7. Instrucciones de Reproducibilidad</h2>

<ol>
  <li>
    Clonar el repositorio:
    <pre><code>git clone https://github.com/santiiis/proyectobigdata.git
cd proyectobigdata</code></pre>
  </li>

  <li>
    Abrir el notebook
    <code>notebooks/Proyecto_Final_BigData_Desercion.ipynb</code>
    en <b>Google Colab</b>.
  </li>

  <li>
    Verificar que las dependencias requeridas estén instaladas.
  </li>

  <li>
    En el menú superior seleccionar:
    <b>Entorno de ejecución → Reiniciar y ejecutar todo</b>.
  </li>

  <li>
    El notebook debe ejecutar el flujo completo:
    <b>Carga → ETL → Parquet → Modelado → MLflow → Resultados → Auditoría ética</b>.
  </li>
</ol>

<hr>

<h2>Resultados Finales del Proyecto</h2>

<ul>
  <li><b>Registros iniciales:</b> 32,593</li>
  <li><b>Registros finales tras ETL:</b> 32,557</li>
  <li><b>Optimización de almacenamiento:</b> 68.5%</li>
  <li><b>Modelo final:</b> Logistic Regression</li>
  <li><b>AUC-ROC:</b> 0.8413</li>
  <li><b>F1-Score:</b> 0.7539</li>
  <li><b>Registros atípicos detectados:</b> 599 (1.84%)</li>
</ul>

<blockquote>
  <b>Recomendación final:</b>
  Utilizar el modelo como un sistema de alerta temprana para identificar
  estudiantes con mayor probabilidad de deserción y permitir la aplicación
  oportuna de estrategias de acompañamiento pedagógico.
</blockquote>
