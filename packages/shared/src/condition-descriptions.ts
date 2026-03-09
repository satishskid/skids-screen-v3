// Clinical descriptions for all 52 4D conditions
// Keyed by condition ID from FOUR_D_CONDITIONS in four-d-mapping.ts
// Ported from V2 — zero content changes

export const CONDITION_DESCRIPTIONS: Record<string, string> = {
  // === DEFECTS (Congenital/Structural) ===
  def1: 'Orofacial cleft involving the lip, palate, or both. Affects feeding, speech, and dental development. Requires early surgical and orthodontic referral.',
  def2: 'Trisomy 21 presenting with characteristic facies, hypotonia, and developmental delay. Associated with cardiac defects and thyroid dysfunction.',
  def3: 'Abnormal accumulation of cerebrospinal fluid within the ventricles of the brain, causing increased head circumference and raised intracranial pressure.',
  def4: 'Suspected structural heart defect based on abnormal heart sounds, cyanosis, or other clinical indicators. Requires echocardiographic confirmation.',
  def5: 'Congenital foot deformity where the foot is twisted inward and downward. Early casting (Ponseti method) or surgical correction may be needed.',
  def6: 'Neural tube defect with incomplete closure of the vertebral column. Severity ranges from occult (asymptomatic) to open defects with neurological impairment.',
  def7: 'Failure of the neural tube to close during early embryonic development. Includes anencephaly and encephalocele. Folic acid supplementation is preventive.',
  def8: 'Extra digits on hands or feet. May be isolated or part of a syndromic condition. Surgical removal is typically performed for functional or cosmetic reasons.',
  def9: 'Congenital gap or notch in the iris, giving a keyhole-shaped pupil. May affect vision depending on extent. Can be part of CHARGE syndrome.',
  def10: 'Unusually high and narrow palate, often associated with genetic syndromes. May cause feeding difficulties and dental crowding.',
  def11: 'Excess skin folds on the lateral neck, associated with Turner syndrome and other chromosomal conditions. Requires genetic evaluation.',
  def12: 'Short or tight lingual frenulum restricting tongue movement. Can impair breastfeeding in infants and speech articulation in older children.',

  // === DELAY (Developmental) ===
  del1: 'Significant delay in expressive or receptive language milestones for age. May indicate hearing loss, autism spectrum disorder, or isolated speech disorder.',
  del2: 'Delay in achieving gross motor milestones such as sitting, standing, and walking. May indicate central or peripheral neurological impairment.',
  del3: 'Delay in fine motor skills including grasping, drawing, and manipulation of small objects. Impacts handwriting and self-care activities.',
  del4: 'Below-expected cognitive functioning for age, affecting learning, problem-solving, and adaptive behavior. Formal psychometric testing recommended.',
  del5: 'Difficulty with age-appropriate self-care and daily living skills. Often co-occurs with cognitive and social delays.',
  del6: 'Reduced social interaction, limited peer engagement, and preference for solitary activities. May indicate autism spectrum disorder or anxiety.',

  // === DISABILITY ===
  dis1: 'Non-progressive motor disorder due to brain injury, causing spasticity, movement difficulties, and postural abnormalities. Requires multidisciplinary management.',
  dis2: 'Significant limitation in intellectual functioning and adaptive behavior. Classified as mild, moderate, severe, or profound based on IQ and functional assessment.',
  dis3: 'Neurodevelopmental condition characterized by persistent deficits in social communication and restricted, repetitive patterns of behavior or interests.',
  dis4: 'Partial or complete hearing loss affecting speech and language development. May be conductive, sensorineural, or mixed. Audiological evaluation required.',
  dis5: 'Reduced visual acuity not correctable to normal with standard lenses. Includes myopia, hyperopia, astigmatism, and amblyopia.',
  dis6: 'Lateral curvature of the spine exceeding 10 degrees. May be idiopathic, congenital, or neuromuscular. Monitoring or bracing may be needed.',

  // === DEFICIENCY (Nutritional) ===
  defc1: 'Weight-for-height below -3 SD or MUAC <115mm or bilateral pitting edema. Life-threatening condition requiring immediate therapeutic feeding.',
  defc2: 'Weight-for-height between -3 SD and -2 SD or MUAC 115-124mm. Requires supplementary feeding and nutritional counseling.',
  defc3: 'Reduced hemoglobin levels indicated by pallor of conjunctivae, nail beds, or palms. Common causes include iron deficiency, chronic infection, and hemoglobinopathies.',
  defc4: 'Deficiency in essential vitamins or minerals (iron, zinc, vitamin A, vitamin D). Clinical signs vary by specific micronutrient.',
  defc5: 'Enlarged thyroid gland due to iodine deficiency. Graded from palpable (Grade 1) to visible (Grade 2-3). Endemic in iodine-poor regions.',
  defc6: 'Enamel defect caused by excessive fluoride intake during tooth development. Ranges from white opacities to brown pitting of teeth.',
  defc7: 'Dry, scaly skin (fish-scale appearance) often indicating vitamin A deficiency. May also be inherited (genetic ichthyosis).',
  defc8: 'Spoon-shaped nails (concave nail plate) strongly associated with iron deficiency anemia. Resolve with iron supplementation.',
  defc9: 'Mid-upper arm circumference below 115mm indicating severe acute malnutrition requiring immediate treatment.',
  defc10: 'Mid-upper arm circumference 115-125mm indicating moderate acute malnutrition requiring supplementary feeding.',
  defc11: 'Bilateral pitting edema indicating kwashiorkor or severe protein-energy malnutrition.',
  defc12: 'Inadequate variety in food groups consumed, increasing risk of multiple micronutrient deficiencies.',

  // === BEHAVIORAL / MENTAL HEALTH ===
  beh1: 'Persistent pattern of inattention, hyperactivity, and impulsivity that interferes with functioning and development across multiple settings.',
  beh2: 'Excessive worry, fear, or nervousness disproportionate to circumstances. May manifest as separation anxiety, generalized anxiety, or social phobia.',
  beh3: 'Persistent low mood, loss of interest in activities, changes in sleep and appetite. In children, may present as irritability rather than sadness.',
  beh4: 'Pattern of angry, vindictive, or defiant behavior toward authority figures lasting at least 6 months. Exceeds normal developmental behavior.',
  beh5: 'Repetitive and persistent pattern of behavior violating age-appropriate societal norms or the rights of others, including aggression and rule-breaking.',
  beh6: 'Emotional or behavioral symptoms developing in response to an identifiable stressor, exceeding what is expected for the situation.',
  beh7: 'Significant emotional disturbance affecting daily functioning, including emotional instability, withdrawal, or inappropriate emotional responses.',
  beh8: 'Excessive screen time and digital device use causing impairment in academic, social, or physical functioning.',

  // === IMMUNIZATION ===
  imz1: 'Child has received all age-appropriate vaccinations according to the national immunization schedule.',
  imz2: 'Child has received some but not all recommended vaccinations. Catch-up immunization schedule should be initiated.',
  imz3: 'Child has not received any vaccinations. Full immunization course should be started according to national guidelines.',
  imz4: 'Vaccinations have been administered behind the recommended schedule. Catch-up schedule needed to achieve full protection.',
  imz5: 'Adverse event following immunization reported. Requires documentation, assessment of causality, and reporting to pharmacovigilance system.',

  // === LEARNING ===
  lrn1: 'Specific learning disability affecting reading accuracy, fluency, and comprehension despite adequate intelligence and instruction.',
  lrn2: 'Specific learning disability affecting number sense, arithmetic facts, and mathematical reasoning despite adequate cognitive ability.',
  lrn3: 'Specific learning disability affecting written expression, including handwriting, spelling, and written composition.',
}
