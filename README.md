

Proyecto integrador de la materia **Prácticas y Herramientas de Big Data** en la **Universidad Internacional del Ecuador (UIDE)**.

* **Integrantes:** Lander González y Erick Morales
* **Docente:** Ing. Diego Pinto
* **Tema:** Predicción de deserción estudiantil (Grupo 7)
* **Dataset Oficial:** [Open University Learning Analytics Dataset (OULAD) en Kaggle](https://www.kaggle.com/datasets/anlgrbz/student-demographics-online-education-dataoulad)

---

## ¿De qué trata este proyecto?

En la mayoría de universidades, el apoyo a estudiantes con dificultades llega tarde: cuando ya reprobaron los exámenes parciales o dejaron de asistir.

El objetivo de este proyecto fue construir un sistema de alerta temprana utilizando Big Data que procese el comportamiento del estudiante en el campus virtual durante las primeras 4 semanas de clases. Con esto, buscamos responder si el nivel de interacción inicial (`sum_click`) y el número de materias reprobadas previamente (`num_of_prev_attempts`) son suficientes para predecir con alta precisión el riesgo de abandono antes de que sea irreversible.

---

## Arquitectura y Flujo de Trabajo

El sistema está construido en capas desacopladas para garantizar procesamiento distribuido y escalabilidad:

[ Datos Crudos OULAD (CSV de Kaggle) ]│▼  (Ingesta distribuida)[ Pipeline ETL en PySpark ] ─────────> Limpieza, imputación y ensamblado de vectores│▼  (Almacenamiento columnar)[ Data Lake en Parquet ] ────────────> Particionado por módulo (reducción del 68.5% en disco)│▼  (Modelado y optimización)[ Spark MLlib + MLflow Tracking ] ───> CrossValidator (3 pliegues) + ParamGrid│▼  (Acción institucional)[ Alertas y Auditoría Ética ] ───────> Disparador de tutorías preventivas (probabilidad > 0.65)
---

## Pipeline ETL y Almacenamiento

Procesamos el dataset OULAD (32,593 registros de estudiantes y millones de registros de navegación LMS) aplicando las siguientes transformaciones en PySpark:

1. **Filtro de fechas anómalas:** Eliminamos registros de matrícula inconsistentes fuera del rango de -150 a +30 días respecto al inicio de clases.
2. **Imputación de valores ausentes:** Tratamos nulos asignando `0.0` a clics sin registro, `0` a intentos previos y `60` créditos (mediana) a la carga académica.
3. **Ingeniería de variables:** Estandarización con `StandardScaler` y vectorización con `VectorAssembler`.
4. **Persistencia en Parquet:** Guardamos los datos limpios particionados por `code_module`. Esto redujo el peso de los datos de **12.4 MB a 3.9 MB** (un ahorro del **68.5%** en almacenamiento y lecturas más rápidas para Spark).

---

## Modelado y Experimentos en MLflow

Probamos tres modelos supervisados con validación cruzada (`CrossValidator` de 3 pliegues) y registramos todos los parámetros y métricas en **MLflow**:

| Run ID | Modelo | Hiperparámetros | AUC-ROC | F1-Score | Veredicto |
| :--- | :--- | :--- | :---: | :---: | :--- |
| `run_01` | Logistic Regression | `regParam = 0.01` | 0.7420 | 0.7180 | Descartado (no captura relaciones no lineales) |
| `run_02` | GBT Classifier | `maxDepth=5, maxIter=20` | 0.8115 | 0.7930 | Buen rendimiento pero más lento de entrenar |
| `run_03` | **Random Forest** | `numTrees=100, maxDepth=8` | **0.8412** | **0.8145** | **Seleccionado como el mejor modelo** |

### Variables más influyentes (Feature Importance)

Al analizar el modelo final de Random Forest, encontramos el peso de cada variable:

* **Interacción en el campus virtual (`sum_click`):** 46.8%
* **Materias reprobadas antes (`num_of_prev_attempts`):** 24.1%
* **Antelación de la matrícula (`date_registration`):** 18.5%
* **Créditos matriculados (`studied_credits`):** 10.6%

> **Conclusión técnica:** El **70.9%** de la decisión del modelo se basa únicamente en la actividad de las primeras semanas y los antecedentes de repitencia.

---

## Calidad de Datos y Consideraciones Éticas

* **Calidad DAMA:** Logramos un 99.8% de completitud tras el tratamiento de nulos y un 100% de consistencia relacional en los identificadores de estudiantes.
* **Privacidad (LOPDP Ecuador):** Los datos se trabajaron con identificadores artificiales (`id_student`), sin nombres, cédulas ni correos. La información solo se utiliza con fines de apoyo pedagógico.
* **Control de sesgos:** Para no perjudicar a estudiantes con problemas de conexión a internet o de zonas rurales, el modelo no decide únicamente por los clics, sino que evalúa el historial académico y la fecha de matrícula de manera conjunta. Además, las alertas se manejan de forma privada como invitaciones a tutorías para evitar estigmatizaciones.

---

## Estructura del Repositorio

├── data/│   └── README.md                       # Enlace directo al dataset OULAD en Kaggle├── notebooks/│   └── notebook_integrador_bigdata.ipynb  # Notebook reproducible de inicio a fin├── docs/│   ├── informe_final_proyecto.pdf      # Informe académico completo (12 secciones)│   └── presentacion_ejecutiva.pdf      # Diapositivas para la defensa de 10 min├── mlruns/                             # Registro local de los runs de MLflow└── README.md                           # Este documento
---

## ¿Cómo reproducir este proyecto?

El cuaderno está preparado para ejecutarse completamente desde cero:

1. Clona este repositorio:
   ```bash
   git clone [https://github.com/santiiis/proyectobigdata.git](https://github.com/santiiis/proyectobigdata.git)
   cd proyectobigdata
Abre el archivo notebooks/notebook_integrador_bigdata.ipynb en Google Colab.En el menú superior, ve a Entorno de ejecución $\rightarrow$ Reiniciar y ejecutar todo.El script instalará las dependencias (pyspark y mlflow), procesará el dataset OULAD, correrá el ETL, persistirá el Data Lake en Parquet, entrenará los 3 modelos y mostrará los resultados sin pedir archivos externos ni pasos manuales.
