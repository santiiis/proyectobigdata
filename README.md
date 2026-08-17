# Predicción de Deserción Estudiantil - Proyecto Integrador Big Data


**Asignatura:** Prácticas y Herramientas de Big Data  
**Institución:** Universidad Internacional del Ecuador (UIDE)  
**Docente:** Ing. Diego Pinto  
**Integrantes:** Lander González & Erick Morales  
**Tema Asignado:** Predicción de Deserción Estudiantil (Grupo 7)  
**Repositorio Oficial:** :contentReference[oaicite:0]{index=0}


---


## 1. Planteamiento del Problema y Pregunta Analítica


La deserción universitaria temprana compromete la continuidad pedagógica y la sostenibilidad institucional. El seguimiento convencional detecta la desconexión del estudiante de manera reactiva, una vez que las calificaciones finales han sido asentadas.


- **Pregunta Analítica:** ¿En qué medida el volumen de interacción en el entorno virtual LMS (`sum_click`) y el historial de intentos previos (`num_of_prev_attempts`) permiten predecir el riesgo de deserción estudiantil antes de las evaluaciones parciales mediante un pipeline distribuido de Big Data?


- **Métrica de Éxito:** Alcanzar un **AUC-ROC ≥ 0.80** y un **F1-Score ≥ 0.75** en el conjunto de prueba independiente (20%), priorizando la minimización de falsos negativos.


---


## 2. Fuentes de Datos y Volumen Masivo


Los datos originales provienen del repositorio público:


[Open University Learning Analytics Dataset (OULAD) en Kaggle](https://www.kaggle.com/datasets/anlgrbz/student-demographics-online-education-dataoulad)


- **32,593 registros de estudiantes:** Datos sociodemográficos, académicos y estado final obtenidos de `studentInfo.csv` y `studentRegistration.csv`.


- **Más de 10.6 millones de interacciones LMS:** Telemetría de clics y logs de navegación en el campus virtual obtenidos de `studentVle.csv`.


---


## 3. Arquitectura de la Solución End-to-End


```text
[ Fuentes CSV / 10.6M Logs OULAD ]
                 │
                 ▼
        (Ingesta distribuida)
                 │
[ Pipeline ETL en Apache Spark ]
                 │
                 ├── Agregación masiva
                 ├── Validación de datos
                 ├── Filtrado temporal
                 ├── Imputación
                 └── Ingeniería de características
                 │
                 ▼
      (Almacenamiento columnar)
                 │
[ Data Lake en Parquet ]
                 │
                 └── Particionado por code_module
                     Reducción del 68.5% en almacenamiento
                 │
                 ▼
    (Entrenamiento y experimentación)
                 │
[ Spark MLlib + MLflow Tracking ]
                 │
                 └── CrossValidator (3 pliegues)
                     + ParamGrid
                 │
                 ▼
[ Resultados y Auditoría Ética ]
                 │
                 └── DAMA, LOPDP y alertas preventivas
4. Pipeline ETL y Almacenamiento Columnar

El procesamiento de los datos se realizó mediante PySpark siguiendo las siguientes etapas:

1. Agregación masiva de telemetría

Procesamiento distribuido de más de 10.6 millones de interacciones para consolidar la actividad de los estudiantes mediante operaciones de agregación en Spark.

2. Validación y eliminación de duplicados

Se verificó la integridad de los registros y se eliminaron datos duplicados o inconsistentes antes del procesamiento final.

3. Filtrado temporal

Se descartaron inconsistencias en date_registration fuera del rango operacional válido de [-150, +30] días respecto al inicio del curso.

4. Imputación determinista

Se asignaron valores para tratar los datos faltantes:

0.0 para clics ausentes.
0 para intentos previos.
60 créditos para valores faltantes de carga académica.
5. Generación de la variable objetivo e ingeniería de características

Se prepararon las variables para el modelado mediante:

VectorAssembler
StandardScaler
6. Almacenamiento en Parquet

Los datos fueron almacenados físicamente en formato Parquet y particionados por code_module.

Formato	Tamaño
CSV	12.4 MB
Parquet	3.9 MB
Reducción	68.5%
Impacto del ETL
Registros iniciales: 32,593
Registros descartados: 36
Registros finales: 32,557
5. Modelado, Experimentación y Tracking en MLflow

Se compararon tres modelos mediante validación cruzada de 3 pliegues, optimización de hiperparámetros con ParamGrid y registro de experimentos en MLflow.

Run ID	Modelo Evaluado	Hiperparámetros Clave	AUC-ROC	F1-Score	Veredicto Técnico
run_01	Logistic Regression	regParam = 0.01	0.8413	0.7539	Seleccionado como modelo final
run_02	GBT Classifier	maxDepth = 5, maxIter = 20	0.8380	0.7728	Rendimiento competitivo
run_03	Random Forest	numTrees = 100, maxDepth = 8	0.8398	0.7719	Rendimiento competitivo
Justificación técnica

Logistic Regression fue seleccionado como modelo final debido a que obtuvo el mayor AUC-ROC (0.8413), métrica primaria definida para el proyecto, y además cumplió el F1-Score mínimo establecido de 0.75.

Aunque GBT obtuvo un F1-Score ligeramente superior, Logistic Regression ofreció una mayor capacidad de discriminación según la métrica principal, además de una mayor interpretabilidad y eficiencia computacional.

6. Importancia Relativa de Variables

La importancia relativa de las variables se estimó a partir del valor absoluto de los coeficientes estandarizados del modelo de Regresión Logística, normalizados porcentualmente respecto a la suma total.

Variable	Importancia
Telemetría acumulada (sum_click)	77.37%
Intentos previos (num_of_prev_attempts)	17.26%
Antelación de matrícula (date_registration)	3.81%
Créditos matriculados (studied_credits)	1.56%

Conclusión Analítica: El 94.63% de la importancia relativa se concentra en la telemetría temprana (sum_click) y el historial de intentos previos (num_of_prev_attempts).

7. Detección de Anomalías

Se identificaron 599 registros estadísticamente atípicos (1.84%) mediante el método Z-Score, utilizando el criterio:

|Z| > 3.0

Estos registros fueron aislados para evaluar su posible impacto en la estabilidad del modelo y evitar distorsiones en el análisis.

8. Gobierno de Datos y Auditoría Ética
Calidad de Datos - DAMA

Se evaluaron las siguientes dimensiones de calidad:

Completitud
Consistencia
Validez
Exactitud
Unicidad
Oportunidad

Después del proceso ETL se alcanzó un 99.8% de completitud y un 100% de consistencia relacional en los identificadores procesados.

Cumplimiento de la LOPDP

Se aplicaron medidas orientadas al cumplimiento de la Ley Orgánica de Protección de Datos Personales del Ecuador:

Seudonimización de identificadores.
Principio de finalidad.
Uso de los datos exclusivamente para apoyo pedagógico y prevención de la deserción.
Riesgos éticos y mitigaciones
Riesgo	Posible impacto	Medida de mitigación
Brecha digital	Penalización de estudiantes con conectividad limitada	No depender únicamente del nivel de clics
Estigmatización	Etiquetar incorrectamente a estudiantes como desertores	Usar las predicciones como alertas preventivas
Decisiones automatizadas incorrectas	Aplicación de medidas académicas basadas únicamente en el modelo	Mantener revisión humana antes de cualquier intervención
9. Instrucciones de Reproducibilidad
1. Clonar el repositorio
git clone https://github.com/santiiis/proyectobigdata.git
cd proyectobigdata
2. Abrir el notebook

Abrir el archivo:

notebooks/Proyecto_Final_BigData_Desercion.ipynb

en Google Colab.

3. Ejecutar el proyecto

En Google Colab seleccionar:

Entorno de ejecución → Reiniciar y ejecutar todo

El notebook debe ejecutar el flujo completo:

Carga
  ↓
ETL
  ↓
Almacenamiento en Parquet
  ↓
Modelado con Spark MLlib
  ↓
Experimentación con MLflow
  ↓
Resultados
  ↓
Auditoría ética
Resultados Finales del Proyecto
Indicador	Resultado
Registros iniciales	32,593
Registros finales tras ETL	32,557
Optimización de almacenamiento	68.5%
Modelo final	Logistic Regression
AUC-ROC	0.8413
F1-Score	0.7539
Registros atípicos detectados	599 (1.84%)
Importancia conjunta de sum_click + num_of_prev_attempts	94.63%
Recomendación Final

El modelo puede utilizarse como un sistema de alerta temprana para identificar estudiantes con mayor probabilidad de deserción y permitir la aplicación oportuna de estrategias de acompañamiento pedagógico.

Las predicciones deben utilizarse como apoyo para la toma de decisiones y no como un mecanismo automático para clasificar o sancionar a los estudiantes.



### Ojo importante


En tu `README.md` **no pongas** `` como te salió arriba si copias desde aquí: esa sintaxis es del chat, no de GitHub. En GitHub usa el enlace normal:


```markdown
**Repositorio Oficial:** [proyectobigdata](https://github.com/santiiis/proyectobigdata)

Así que en la primera parte, deja exactamente esta línea:

**Repositorio Oficial:** [proyectobigdata](https://github.com/santiiis/proyectobigdata)

Con este formato las tablas, bloques de código y arquitectura deberían verse correctamente en GitHub.

????? bro quiero el reamde completo pues 

JAJA sí bro, tienes razón 😭. Te lo dejé con explicaciones y bloques separados. Aquí va TODO el README completo, limpio y listo para copiar y pegar directamente en README.md:

# Predicción de Deserción Estudiantil - Proyecto Integrador Big Data


**Asignatura:** Prácticas y Herramientas de Big Data  
**Institución:** Universidad Internacional del Ecuador (UIDE)  
**Docente:** Ing. Diego Pinto  
**Integrantes:** Lander González & Erick Morales  
**Tema Asignado:** Predicción de Deserción Estudiantil (Grupo 7)  
**Repositorio Oficial:** [proyectobigdata](https://github.com/santiiis/proyectobigdata)


---


## 1. Planteamiento del Problema y Pregunta Analítica


La deserción universitaria temprana compromete la continuidad pedagógica y la sostenibilidad institucional. El seguimiento convencional detecta la desconexión del estudiante de manera reactiva, una vez que las calificaciones finales han sido asentadas.


- **Pregunta Analítica:** ¿En qué medida el volumen de interacción en el entorno virtual LMS (`sum_click`) y el historial de intentos previos (`num_of_prev_attempts`) permiten predecir el riesgo de deserción estudiantil antes de las evaluaciones parciales mediante un pipeline distribuido de Big Data?


- **Métrica de Éxito:** Alcanzar un **AUC-ROC ≥ 0.80** y un **F1-Score ≥ 0.75** en el conjunto de prueba independiente (20%), priorizando la minimización de falsos negativos.


---


## 2. Fuentes de Datos y Volumen Masivo


Los datos originales provienen del repositorio público:


[Open University Learning Analytics Dataset (OULAD) en Kaggle](https://www.kaggle.com/datasets/anlgrbz/student-demographics-online-education-dataoulad)


- **32,593 registros de estudiantes:** Datos sociodemográficos, académicos y estado final obtenidos de `studentInfo.csv` y `studentRegistration.csv`.


- **Más de 10.6 millones de interacciones LMS:** Telemetría de clics y logs de navegación en el campus virtual obtenidos de `studentVle.csv`.


---


## 3. Arquitectura de la Solución End-to-End


```text
[ Fuentes CSV / 10.6M Logs OULAD ]
                 │
                 ▼
        (Ingesta distribuida)
                 │
[ Pipeline ETL en Apache Spark ]
                 │
                 ├── Agregación masiva
                 ├── Validación de datos
                 ├── Filtrado temporal
                 ├── Imputación
                 └── Ingeniería de características
                 │
                 ▼
      (Almacenamiento columnar)
                 │
[ Data Lake en Parquet ]
                 │
                 └── Particionado por code_module
                     Reducción del 68.5% en almacenamiento
                 │
                 ▼
    (Entrenamiento y experimentación)
                 │
[ Spark MLlib + MLflow Tracking ]
                 │
                 └── CrossValidator (3 pliegues)
                     + ParamGrid
                 │
                 ▼
[ Resultados y Auditoría Ética ]
                 │
                 └── DAMA, LOPDP y alertas preventivas
4. Pipeline ETL y Almacenamiento Columnar

El procesamiento de los datos se realizó mediante PySpark siguiendo las siguientes etapas:

1. Agregación masiva de telemetría

Procesamiento distribuido de más de 10.6 millones de interacciones para consolidar la actividad de los estudiantes mediante operaciones de agregación en Spark.

2. Validación y eliminación de duplicados

Se verificó la integridad de los registros y se eliminaron datos duplicados o inconsistentes antes del procesamiento final.

3. Filtrado temporal

Se descartaron inconsistencias en date_registration fuera del rango operacional válido de [-150, +30] días respecto al inicio del curso.

4. Imputación determinista

Se asignaron valores para tratar los datos faltantes:

0.0 para clics ausentes.
0 para intentos previos.
60 créditos para valores faltantes de carga académica.
5. Generación de la variable objetivo e ingeniería de características

Se prepararon las variables para el modelado mediante:

VectorAssembler
StandardScaler
6. Almacenamiento en Parquet

Los datos fueron almacenados físicamente en formato Parquet y particionados por code_module.

Formato	Tamaño
CSV	12.4 MB
Parquet	3.9 MB
Reducción	68.5%
Impacto del ETL
Registros iniciales: 32,593
Registros descartados: 36
Registros finales: 32,557
5. Modelado, Experimentación y Tracking en MLflow

Se compararon tres modelos mediante validación cruzada de 3 pliegues, optimización de hiperparámetros con ParamGrid y registro de experimentos en MLflow.

Run ID	Modelo Evaluado	Hiperparámetros Clave	AUC-ROC	F1-Score	Veredicto Técnico
run_01	Logistic Regression	regParam = 0.01	0.8413	0.7539	Seleccionado como modelo final
run_02	GBT Classifier	maxDepth = 5, maxIter = 20	0.8380	0.7728	Rendimiento competitivo
run_03	Random Forest	numTrees = 100, maxDepth = 8	0.8398	0.7719	Rendimiento competitivo
Justificación técnica

Logistic Regression fue seleccionado como modelo final debido a que obtuvo el mayor AUC-ROC (0.8413), métrica primaria definida para el proyecto, y además cumplió el F1-Score mínimo establecido de 0.75.

Aunque GBT obtuvo un F1-Score ligeramente superior, Logistic Regression fue seleccionado debido a que el AUC-ROC fue la métrica principal definida desde el planteamiento del proyecto. Adicionalmente, el modelo ofrece mayor interpretabilidad y eficiencia computacional.

6. Importancia Relativa de Variables

La importancia relativa de las variables se estimó a partir del valor absoluto de los coeficientes estandarizados del modelo de Regresión Logística, normalizados porcentualmente respecto a la suma total.

Variable	Importancia
Telemetría acumulada (sum_click)	77.37%
Intentos previos (num_of_prev_attempts)	17.26%
Antelación de matrícula (date_registration)	3.81%
Créditos matriculados (studied_credits)	1.56%

Conclusión Analítica: El 94.63% de la importancia relativa se concentra en la telemetría temprana (sum_click) y el historial de intentos previos (num_of_prev_attempts).

7. Detección de Anomalías

Se identificaron 599 registros estadísticamente atípicos (1.84%) mediante el método Z-Score, utilizando el criterio:

|Z| > 3.0

Estos registros fueron aislados para evaluar su posible impacto en la estabilidad del modelo y evitar distorsiones en el análisis.

8. Gobierno de Datos y Auditoría Ética
Calidad de Datos - DAMA

Se evaluaron las siguientes dimensiones de calidad:

Completitud
Consistencia
Validez
Exactitud
Unicidad
Oportunidad

Después del proceso ETL se alcanzó un 99.8% de completitud y un 100% de consistencia relacional en los identificadores procesados.

Cumplimiento de la LOPDP

Se aplicaron medidas orientadas al cumplimiento de la Ley Orgánica de Protección de Datos Personales del Ecuador:

Seudonimización de identificadores.
Principio de finalidad.
Uso de los datos exclusivamente para apoyo pedagógico y prevención de la deserción.
Riesgos éticos y mitigaciones
Riesgo	Posible impacto	Medida de mitigación
Brecha digital	Penalización de estudiantes con conectividad limitada	No depender únicamente del nivel de clics
Estigmatización	Etiquetar incorrectamente a estudiantes como desertores	Usar las predicciones como alertas preventivas
Decisiones automatizadas incorrectas	Aplicación de medidas académicas basadas únicamente en el modelo	Mantener revisión humana antes de cualquier intervención
9. Instrucciones de Reproducibilidad
1. Clonar el repositorio
git clone https://github.com/santiiis/proyectobigdata.git
cd proyectobigdata
2. Abrir el notebook

Abrir el archivo:

notebooks/Proyecto_Final_BigData_Desercion.ipynb

en Google Colab.

3. Ejecutar el proyecto

En Google Colab seleccionar:

Entorno de ejecución → Reiniciar y ejecutar todo

El notebook debe ejecutar el flujo completo:

Carga
  ↓
ETL
  ↓
Almacenamiento en Parquet
  ↓
Modelado con Spark MLlib
  ↓
Experimentación con MLflow
  ↓
Resultados
  ↓
Auditoría ética
Resultados Finales del Proyecto
Indicador	Resultado
Registros iniciales	32,593
Registros finales tras ETL	32,557
Optimización de almacenamiento	68.5%
Modelo final	Logistic Regression
AUC-ROC	0.8413
F1-Score	0.7539
Registros atípicos detectados	599 (1.84%)
Importancia conjunta de sum_click + num_of_prev_attempts	94.63%
Recomendación Final

El modelo puede utilizarse como un sistema de alerta temprana para identificar estudiantes con mayor probabilidad de deserción y permitir la aplicación oportuna de estrategias de acompañamiento pedagógico.

Las predicciones deben utilizarse como apoyo para la toma de decisiones y no como un mecanismo automático para clasificar o sancionar a los estudiantes.
