<h1>Predicción de Deserción Estudiantil - Proyecto Integrador Big Data</h1>

<p>
  <strong>Asignatura:</strong> Prácticas y Herramientas de Big Data<br>
  <strong>Institución:</strong> Universidad Internacional del Ecuador (UIDE)<br>
  <strong>Docente:</strong> Ing. Diego Pinto<br>
  <strong>Integrantes:</strong> Lander González &amp; Erick Morales<br>
  <strong>Tema Asignado:</strong> Predicción de Deserción Estudiantil (Grupo 7)
</p>

<hr>

<h2>1. Planteamiento del Problema y Pregunta Analítica</h2>

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
    Alcanzar un <strong>AUC-ROC ≥ 0.80</strong> y un 
    <strong>F1-Score ≥ 0.75</strong> en el conjunto de prueba independiente del 20%, 
    priorizando la minimización de falsos negativos.
  </li>
</ul>

<hr>

<h2>2. Fuentes de Datos y Volumen Masivo</h2>

<p>
  Los datos originales provienen del 
  <strong>Open University Learning Analytics Dataset (OULAD)</strong>.
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

<h2>3. Arquitectura de la Solución End-to-End</h2>

<pre>
[ Fuentes CSV / 10.6M Logs OULAD ]
                 │
                 ▼
        Ingesta distribuida
                 │
                 ▼
[ Pipeline ETL en Apache Spark ]
                 │
                 ├── Agregación masiva
                 ├── Validación de datos
                 ├── Filtrado temporal
                 ├── Imputación
                 └── Ingeniería de características
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
                 ├── CrossValidator
                 ├── 3 pliegues
                 └── ParamGrid
                 │
                 ▼
[ Resultados y Auditoría Ética ]
                 │
                 ├── Calidad DAMA
                 ├── LOPDP
                 └── Riesgos y mitigaciones
</pre>

<hr>

<h2>4. Pipeline ETL y Almacenamiento Columnar</h2>

<p>
  El procesamiento de los datos se realizó mediante <strong>PySpark</strong>, 
  siguiendo las siguientes etapas:
</p>

<h3>4.1 Agregación masiva de telemetría</h3>

<p>
  Se procesaron de forma distribuida más de <strong>10.6 millones de interacciones</strong>
  del entorno virtual para consolidar la actividad de los estudiantes mediante variables como
  <code>sum_click</code>, <code>id_student</code> y <code>code_module</code>.
</p>

<h3>4.2 Validación y eliminación de duplicados</h3>

<p>
  Se verificó la integridad de los registros y se eliminaron datos duplicados o inconsistentes
  antes del procesamiento final.
</p>

<h3>4.3 Filtrado temporal</h3>

<p>
  Se descartaron inconsistencias en <code>date_registration</code> fuera del rango
  operacional válido de <strong>[-150, +30] días</strong> respecto al inicio del curso.
</p>

<h3>4.4 Imputación determinista</h3>

<ul>
  <li><code>0.0</code> para clics ausentes.</li>
  <li><code>0</code> para intentos previos.</li>
  <li><code>60</code> créditos para valores faltantes de carga académica.</li>
</ul>

<h3>4.5 Ingeniería de características</h3>

<p>Las variables utilizadas para el modelado fueron preparadas mediante:</p>

<ul>
  <li><code>VectorAssembler</code></li>
  <li><code>StandardScaler</code></li>
</ul>

<h3>4.6 Almacenamiento en Parquet</h3>

<p>
  Los datos procesados fueron almacenados en formato <strong>Parquet</strong> y
  particionados por <code>code_module</code>.
</p>

<table>
  <thead>
    <tr>
      <th>Formato</th>
      <th>Tamaño</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>CSV</td>
      <td>12.4 MB</td>
    </tr>
    <tr>
      <td>Parquet</td>
      <td>3.9 MB</td>
    </tr>
    <tr>
      <td><strong>Reducción</strong></td>
      <td><strong>68.5%</strong></td>
    </tr>
  </tbody>
</table>

<h3>Impacto del ETL</h3>

<table>
  <thead>
    <tr>
      <th>Indicador</th>
      <th>Resultado</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Registros iniciales</td>
      <td>32,593</td>
    </tr>
    <tr>
      <td>Registros descartados</td>
      <td>36</td>
    </tr>
    <tr>
      <td>Registros finales</td>
      <td><strong>32,557</strong></td>
    </tr>
  </tbody>
</table>

<hr>

<h2>5. Modelado, Experimentación y Tracking en MLflow</h2>

<p>
  Se compararon tres modelos mediante validación cruzada de <strong>3 pliegues</strong>,
  optimización de hiperparámetros con <code>ParamGrid</code> y registro de experimentos
  en <strong>MLflow</strong>.
</p>

<table>
  <thead>
    <tr>
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
      <td><strong>Logistic Regression</strong></td>
      <td><code>regParam = 0.01</code></td>
      <td><strong>0.8413</strong></td>
      <td>0.7539</td>
      <td><strong>Seleccionado como modelo final</strong></td>
    </tr>

    <tr>
      <td><code>run_02</code></td>
      <td>GBT Classifier</td>
      <td><code>maxDepth = 5, maxIter = 20</code></td>
      <td>0.8380</td>
      <td><strong>0.7728</strong></td>
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

<h3>Justificación técnica</h3>

<p>
  <strong>Logistic Regression</strong> fue seleccionado como modelo final debido a que
  obtuvo el mayor <strong>AUC-ROC de 0.8413</strong>, siendo esta la métrica principal
  definida para el proyecto.
</p>

<p>
  Además, alcanzó un <strong>F1-Score de 0.7539</strong>, cumpliendo el valor mínimo
  establecido de 0.75.
</p>

<p>
  Aunque el modelo GBT obtuvo un F1-Score ligeramente superior, la Regresión Logística
  presentó una mejor capacidad global de discriminación según el AUC-ROC, además de
  ofrecer mayor interpretabilidad y eficiencia computacional.
</p>

<hr>

<h2>6. Importancia Relativa de Variables</h2>

<p>
  La importancia relativa de las variables se estimó a partir del valor absoluto de los
  coeficientes estandarizados del modelo de Regresión Logística, normalizados porcentualmente.
</p>

<table>
  <thead>
    <tr>
      <th>Variable</th>
      <th>Importancia</th>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td>Telemetría acumulada (<code>sum_click</code>)</td>
      <td><strong>77.37%</strong></td>
    </tr>

    <tr>
      <td>Intentos previos (<code>num_of_prev_attempts</code>)</td>
      <td><strong>17.26%</strong></td>
    </tr>

    <tr>
      <td>Antelación de matrícula (<code>date_registration</code>)</td>
      <td>3.81%</td>
    </tr>

    <tr>
      <td>Créditos matriculados (<code>studied_credits</code>)</td>
      <td>1.56%</td>
    </tr>
  </tbody>
</table>

<blockquote>
  <strong>Conclusión Analítica:</strong>
  El <strong>94.63%</strong> de la importancia relativa se concentra en la telemetría
  temprana (<code>sum_click</code>) y el historial de intentos previos
  (<code>num_of_prev_attempts</code>).
</blockquote>

<hr>

<h2>7. Detección de Anomalías</h2>

<p>
  Se identificaron <strong>599 registros estadísticamente atípicos</strong>,
  equivalentes al <strong>1.84%</strong> de los datos analizados, mediante el método
  <strong>Z-Score</strong>.
</p>

<p>El criterio utilizado fue:</p>

<pre>|Z| &gt; 3.0</pre>

<p>
  Estos registros fueron identificados como posibles valores atípicos para evaluar
  su impacto dentro del análisis y del comportamiento general de los datos.
</p>

<hr>

<h2>8. Gobierno de Datos y Auditoría Ética</h2>

<h3>Calidad de Datos - DAMA</h3>

<ul>
  <li>Completitud</li>
  <li>Consistencia</li>
  <li>Validez</li>
  <li>Exactitud</li>
  <li>Unicidad</li>
  <li>Oportunidad</li>
</ul>

<p>
  Después del proceso ETL se alcanzó un <strong>99.8% de completitud</strong>
  y un <strong>100% de consistencia relacional</strong> en los identificadores procesados.
</p>

<h3>Cumplimiento de la LOPDP</h3>

<ul>
  <li>Seudonimización de identificadores.</li>
  <li>Aplicación del principio de finalidad.</li>
  <li>Uso de los datos exclusivamente para análisis y apoyo pedagógico.</li>
  <li>Evitar decisiones automáticas que afecten directamente al estudiante.</li>
</ul>

<h3>Riesgos éticos y mitigaciones</h3>

<table>
  <thead>
    <tr>
      <th>Riesgo</th>
      <th>Posible impacto</th>
      <th>Medida de mitigación</th>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td>Brecha digital</td>
      <td>Penalización de estudiantes con conectividad limitada</td>
      <td>No depender únicamente del nivel de clics</td>
    </tr>

    <tr>
      <td>Estigmatización</td>
      <td>Clasificación incorrecta de estudiantes como desertores</td>
      <td>Utilizar las predicciones como alertas preventivas</td>
    </tr>

    <tr>
      <td>Decisiones automatizadas</td>
      <td>Aplicación de medidas basadas únicamente en el modelo</td>
      <td>Mantener revisión humana antes de cualquier intervención</td>
    </tr>
  </tbody>
</table>

<hr>

<h2>9. Instrucciones de Reproducibilidad</h2>

<h3>1. Clonar el repositorio</h3>

<pre><code>git clone [URL_DEL_REPOSITORIO]
cd proyectobigdata</code></pre>

<h3>2. Abrir el notebook</h3>

<p>
  Abrir el archivo:
</p>

<pre><code>notebooks/Proyecto_Final_BigData_Desercion.ipynb</code></pre>

<p>en Google Colab.</p>

<h3>3. Ejecutar el proyecto</h3>

<p>
  En Google Colab seleccionar:
</p>

<pre><code>Entorno de ejecución → Reiniciar y ejecutar todo</code></pre>

<p>El notebook ejecuta el siguiente flujo:</p>

<pre>
Carga de datos
      ↓
Pipeline ETL
      ↓
Almacenamiento en Parquet
      ↓
Modelado con Spark MLlib
      ↓
Experimentación con MLflow
      ↓
Evaluación de resultados
      ↓
Detección de anomalías
      ↓
Auditoría ética
</pre>

<hr>

<h2>Resultados Finales del Proyecto</h2>

<table>
  <thead>
    <tr>
      <th>Indicador</th>
      <th>Resultado</th>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td>Registros iniciales</td>
      <td>32,593</td>
    </tr>

    <tr>
      <td>Registros finales tras ETL</td>
      <td><strong>32,557</strong></td>
    </tr>

    <tr>
      <td>Reducción de almacenamiento</td>
      <td><strong>68.5%</strong></td>
    </tr>

    <tr>
      <td>Modelo seleccionado</td>
      <td><strong>Logistic Regression</strong></td>
    </tr>

    <tr>
      <td>AUC-ROC</td>
      <td><strong>0.8413</strong></td>
    </tr>

    <tr>
      <td>F1-Score</td>
      <td><strong>0.7539</strong></td>
    </tr>

    <tr>
      <td>Registros atípicos detectados</td>
      <td><strong>599 (1.84%)</strong></td>
    </tr>

    <tr>
      <td>Importancia conjunta de variables principales</td>
      <td><strong>94.63%</strong></td>
    </tr>
  </tbody>
</table>

<hr>

<h2>Conclusión</h2>

<p>
  El proyecto permitió construir un flujo completo de análisis Big Data para la
  <strong>predicción del riesgo de deserción estudiantil</strong>, integrando procesamiento
  distribuido con PySpark, almacenamiento en Parquet, modelado mediante Spark MLlib,
  experimentación con MLflow y una evaluación de gobierno y ética de datos.
</p>

<p>
  El modelo de <strong>Regresión Logística</strong> obtuvo un
  <strong>AUC-ROC de 0.8413</strong> y un <strong>F1-Score de 0.7539</strong>,
  cumpliendo las métricas definidas para el proyecto.
</p>

<p>
  Los resultados muestran que la interacción en el entorno virtual
  (<code>sum_click</code>) y los intentos previos
  (<code>num_of_prev_attempts</code>) son las variables con mayor influencia
  dentro del modelo, concentrando conjuntamente el <strong>94.63%</strong>
  de la importancia relativa.
</p>

<p>
  El modelo puede utilizarse como un sistema de <strong>alerta temprana</strong>
  para apoyar la identificación de estudiantes que podrían requerir acompañamiento
  académico. Sin embargo, las predicciones deben utilizarse como apoyo para la toma
  de decisiones y siempre complementarse con revisión humana.
</p>
