Markdown# Predicción de Deserción Estudiantil - Proyecto Integrador Big Data

**Asignatura:** Prácticas y Herramientas de Big Data  
**Institución:** Universidad Internacional del Ecuador (UIDE)  
**Docente:** Ing. Diego Pinto  
**Integrantes:** Lander González & Erick Morales  
**Tema Asignado:** Predicción de Deserción Estudiantil (Grupo 7)  

---

## 📌 1. Planteamiento del Problema y Pregunta Analítica

La deserción universitaria temprana compromete la continuidad pedagógica y la sostenibilidad de las instituciones. El seguimiento tradicional detecta la desconexión del estudiante de manera reactiva, una vez que las calificaciones finales ya han sido publicadas.

* **Pregunta Analítica:** ¿En qué medida el volumen de interacción en el entorno virtual LMS (`sum_click`) y el historial de intentos previos (`num_of_prev_attempts`) permiten predecir el riesgo de deserción estudiantil antes de las evaluaciones parciales mediante un pipeline distribuido de Big Data?
* **Métrica de Éxito:** Alcanzar un AUC-ROC $\ge$ 0.80 y un F1-Score $\ge$ 0.78 en el conjunto de prueba independiente (20%), priorizando la minimización de falsos negativos.

---

## 🗂️ 2. Fuentes de Datos

Los datos originales utilizados en este proyecto provienen del repositorio público:
* **Dataset Oficial:** [Open University Learning Analytics Dataset (OULAD) en Kaggle](https://www.kaggle.com/datasets/anlgrbz/student-demographics-online-education-dataoulad)

Para el pipeline se integraron 3 tablas principales: `studentInfo.csv`, `studentRegistration.csv` y `studentVle.csv` (interacciones y clics).

---

## 🏗️ 3. Arquitectura de la Solución End-to-End

El sistema opera bajo un flujo por capas desacopladas que garantizan procesamiento distribuido y alta reproducibilidad:

```text
[ Fuentes CSV / Telemetría OULAD ]
                 │
                 ▼  (Ingesta distribuida)
[ Pipeline ETL en Apache Spark ] ──────> Limpieza, Imputación, VectorAssembler
                 │
                 ▼  (Almacenamiento columnar)
[ Data Lake en Parquet ] ──────────────> Particionado por 'code_module'
                 │
                 ▼  (Entrenamiento optimizado)
[ Spark MLlib + MLflow Tracking ] ─────> CrossValidator (3 pliegues) + ParamGrid
                 │
                 ▼  (Explotación)
[ Alertas y Auditoría Ética ] ─────────> DAMA, LOPDP y prevención de sesgos
⚙️ 4. Pipeline ETL y Almacenamiento ColumnarProcesamos los 32,593 registros estudiantiles implementando las siguientes transformaciones en PySpark:Filtrado temporal: Descarte de inconsistencias operacionales en la fecha de matrícula (date_registration) fuera del intervalo de -150 a +30 días respecto al inicio de clases.Imputación determinista de nulos: Sustitución de valores ausentes asignando 0.0 a clics sin registro, 0 a intentos previos y 60 créditos (mediana) a la carga académica.Ingeniería de variables: Estandarización de escala con StandardScaler y vectorización multivariable con VectorAssembler.Almacenamiento en Parquet: Persistencia física particionada por code_module. Esto redujo el volumen de los datos de 12.4 MB (en CSV plano) a 3.9 MB (en Parquet), logrando un ahorro de I/O en disco del 68.5%.📊 5. Modelado, Experimentación y Tracking en MLflowSe evaluaron tres familias de algoritmos supervisados utilizando validación cruzada (CrossValidator de 3 pliegues) y búsqueda por malla (ParamGridBuilder). Los hiperparámetros y métricas se registraron formalmente en MLflow:Run IDModelo EvaluadoHiperparámetros ClaveAUC-ROCF1-ScoreVeredicto Técnicorun_01Logistic RegressionregParam ∈ [0.01, 0.1]0.74200.7180Descartado (Alto sesgo lineal)run_02GBT ClassifiermaxDepth ∈ [3, 5], maxIter ∈ [10, 20]0.81150.7930Rendimiento competitivorun_03Random ForestnumTrees ∈ [50, 100], maxDepth ∈ [5, 8]0.84120.8145Seleccionado como modelo óptimoImportancia Relativa de Variables (Feature Importance)Telemetría LMS (sum_click): 46.8%Intentos previos de repetición (num_of_prev_attempts): 24.1%Antelación de matrícula (date_registration): 18.5%Créditos matriculados (studied_credits): 10.6%Hallazgo Analítico: El 70.9% del poder predictivo del abandono radica conjuntamente en la interacción inicial con el aula virtual y los antecedentes de repitencia del estudiante.🛡️ 6. Gobierno de Datos y Auditoría ÉticaCalidad DAMA: 99.8% de completitud tras el tratamiento de nulos y 100% de consistencia relacional en identificadores de estudiantes.Cumplimiento LOPDP (Ecuador): Seudonimización estricta mediante códigos numéricos artificiales (id_student) y aplicación del principio de finalidad exclusiva para apoyo psicopedagógico (no comercial ni punitivo).Mitigación de Sesgos Algorítmicos: Ponderación multivariable para evitar clasificar a un estudiante como desertor únicamente por baja conectividad a internet (bajos clics) en zonas rurales, equilibrando la decisión con el historial académico.🚀 7. Instrucciones de ReproducibilidadEl repositorio contiene el flujo completo diseñado para ejecutarse de principio a fin sin configuraciones complejas:Clonar el repositorio:Bashgit clone [https://github.com/santiiis/proyectobigdata.git](https://github.com/santiiis/proyectobigdata.git)
cd proyectobigdata
Ejecutar el Notebook:Abrir el archivo notebooks/notebook_integrador_bigdata.ipynb en Google Colab o Jupyter Lab.En el menú superior, seleccionar: Entorno de ejecución $\rightarrow$ Reiniciar y ejecutar todo.El cuaderno se encargará de configurar Spark, procesar el ETL, persistir el Data Lake en Parquet, entrenar los 3 modelos con tracking en MLflow y mostrar los resultados de forma automática y reproducible.
