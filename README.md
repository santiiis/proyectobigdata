Markdown
# Sistema Distribuido de Alerta Temprana para la Prediccion de Desercion Estudiantil

**Asignatura:** Practicas y Herramientas de Big Data  
**Institucion:** Universidad Internacional del Ecuador (UIDE)  
**Docente:** Ing. Diego Pinto  
**Integrantes:** Lander Gonzalez & Erick Morales  
**Tema Asignado:** Prediccion de Desercion Estudiantil (Grupo 7)  
**Repositorio Oficial:** https://github.com/santiiis/proyectobigdata  

---

## 1. Planteamiento del Problema y Pregunta Analitica

La desercion universitaria temprana compromete la continuidad academica y la sostenibilidad institucional. Los mecanismos reactivos tradicionales detectan el fracaso pedagogico unicamente cuando las calificaciones finales ya estan registradas, impidiendo intervenciones oportunas.

* **Pregunta Analitica:** En que medida el volumen de interaccion en el entorno virtual LMS (sum_click) y el historial de intentos previos (num_of_prev_attempts) permiten predecir con precision el riesgo de desercion estudiantil antes de las evaluaciones parciales mediante un pipeline distribuido de Big Data?
* **Metrica de Exito Definida:** Lograr un AUC-ROC >= 0.80 y un F1-Score >= 0.78 en el conjunto de prueba independiente (20%), priorizando la minimizacion de falsos negativos en la poblacion en riesgo.

---

## 2. Arquitectura de la Solucion End-to-End

[ Fuentes en Crudo (Dataset OULAD / Telemetria LMS) ]
|
v  (Ingesta Distribuida)
[ Pipeline ETL en Apache Spark (PySpark) ] ----> Filtros temporales, Imputacion, VectorAssembler
|
v  (Persistencia Columnar)
[ Data Lake Parquet ] -------------------------> Particionado por 'code_module' (-68.5% tamano)
|
v  (Lectura Optimizada)
[ Spark MLlib Pipeline + MLflow Tracking ] ----> ParamGrid + CrossValidator (3-Folds)
|
v  (Inferencia y Despliegue)
[ Resultados, Auditoria DAMA/LOPDP y Alertas ] -> Umbral preventivo (> 0.65)


---

## 3. Pipeline ETL y Estrategia de Almacenamiento

* **Dataset Utilizado:** Open University Learning Analytics Dataset (OULAD), estructurado a partir de perfiles sociodemograficos, matriculas y registros de clics en la plataforma.
* **Transformaciones Aplicadas en PySpark:**
  * **Filtrado temporal:** Descarte de inconsistencias operacionales en `date_registration` fuera del intervalo valido [-150, +30] dias respecto al inicio del periodo lectivo.
  * **Imputacion determinista de nulos:** Sustitucion de valores ausentes (`sum_click` -> 0.0, `num_of_prev_attempts` -> 0, `studied_credits` -> 60).
  * **Ingenieria de caracteristicas:** Normalizacion con `StandardScaler` y vectorizacion multivariable mediante `VectorAssembler`.
* **Cifras de Impacto:**
  * **32,593 registros procesados** con 100% de consistencia e integridad relacional.
  * Reduccion de almacenamiento de **12.4 MB** (CSV en bruto) a **3.9 MB** (Parquet particionado por `code_module`), logrando un **ahorro de I/O en disco del 68.5%**.

---

## 4. Modelado, Experimentacion y Tracking con MLflow

Se evaluaron tres familias de algoritmos supervisados utilizando validacion cruzada estratificada (`CrossValidator` de 3 pliegues) y busqueda de cuadricula (`ParamGridBuilder`), registrando parametros, modelos y metricas en **MLflow**:

| Run ID | Modelo Evaluado | Hiperparametros Clave | AUC-ROC | F1-Score | Veredicto Tecnico |
| :--- | :--- | :--- | :---: | :---: | :--- |
| run_01 | Logistic Regression | regParam in [0.01, 0.1] | 0.7420 | 0.7180 | Descartado (Alto sesgo lineal) |
| run_02 | GBT Classifier | maxDepth in [3, 5], maxIter in [10, 20] | 0.8115 | 0.7930 | Desempeno competitivo |
| run_03 | Random Forest (Optimo) | numTrees in [50, 100], maxDepth in [5, 8] | 0.8412 | 0.8145 | Seleccionado como modelo optimo |

### Importancia Relativa de Caracteristicas (Feature Importance)
* `sum_click` (Interacciones en plataforma LMS): **46.8%**
* `num_of_prev_attempts` (Intentos previos de repeticion): **24.1%**
* `date_registration` (Antelacion de matricula): **18.5%**
* `studied_credits` (Creditos matriculados): **10.6%**

> **Conclusion de Negocio:** El **70.9%** del peso predictivo del riesgo de desercion reside conjuntamente en la telemetria temprana dentro del campus virtual y los antecedentes de repitencia del estudiante.

---

## 5. Gobierno de Datos, Marco LOPDP y Mitigacion Etica

* **Calidad DAMA (6 Dimensiones):** 99.8% de completitud en variables numericas tras imputacion y 100% de integridad referencial en `id_student`.
* **Cumplimiento LOPDP (Ecuador):** Seudonimizacion irreversible de identificadores y aplicacion del principio de finalidad exclusiva para el soporte pedagogico institucional.
* **Mitigacion de Sesgos Algoritmicos:** Ponderacion multivariable para evitar catalogar erroneamente a estudiantes de zonas con baja conectividad domiciliaria como potenciales desertores unicamente por su volumen de clics.

---

## 6. Estructura del Repositorio

├── data/
│   └── README.md                               # Enlace y descripcion de fuentes de datos OULAD
├── notebooks/
│   └── Proyecto_Final_BigData_Desercion.ipynb  # Notebook Spark reproducible End-to-End
├── docs/
│   ├── informe_final_bigdata.pdf               # Informe final de 12 secciones (LaTeX)
│   └── presentacion_ejecutiva.pdf              # Diapositivas de la defensa (10 min)
├── mlruns/                                     # Artefactos y metricas registradas en MLflow
└── README.md                                   # Documentacion tecnica principal


---

## 7. Instrucciones de Reproducibilidad

El flujo completo esta disenado para ejecutarse de principio a fin sin configuraciones complejas ni fallos de dependencias locales:

1. **Clonar el repositorio:**
   ```bash
   git clone [https://github.com/santiiis/proyectobigdata.git](https://github.com/santiiis/proyectobigdata.git)
   cd proyectobigdata
Ejecutar el Notebook en Google Colab o Jupyter:

Abrir notebooks/Proyecto_Final_BigData_Desercion.ipynb.

En el menu superior de Google Colab, seleccionar: Entorno de ejecucion -> Reiniciar y ejecutar todo.

El script inicializara la sesion distribuida de Spark, procesara el pipeline ETL, persistira el Data Lake en Parquet, entrenara los modelos con tracking en MLflow y desplegara las metricas y graficos de forma 100% reproducible.
