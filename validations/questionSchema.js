import { z } from 'zod';
export const CreateQuestionSchema = z.object({
  body: z.string()
    .min(1, "Question cannot be empty")
    .max(500, "Question cannot exceed 500 characters"),
  
  answer: z.string()
    .max(1000, "Answer cannot exceed 1000 characters")
    .optional()
    .nullable(),
  
  status: z.enum(['pending', 'answered', 'ignored'])
    .default('pending'),
  
  visibility: z.enum(['public', 'private'])
    .default('public')
});
// POST /api/questions/:id/answer
export const AnswerQuestionSchema = z.object({
  answer: z.string()
    .min(1, "Answer cannot be empty")
    .max(1000, "Answer cannot exceed 1000 characters"),
  
  visibility: z.enum(['public', 'private'])
    .optional()
    .default('public')
});

// PATCH /api/questions/:id
export const UpdateQuestionSchema = z.object({
  answer: z.string()
    .min(1, "Answer cannot be empty")
    .max(1000, "Answer cannot exceed 1000 characters")
    .optional(),
  
  status: z.enum(['pending', 'answered', 'ignored'])
    .optional(),
  
  visibility: z.enum(['public', 'private'])
    .optional()
})
.refine(data => Object.keys(data).length > 0, {
  message: "At least one field must be provided for update"
});

// Params validation
export const UsernameParamsSchema = z.object({
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username cannot exceed 30 characters")
});

export const QuestionIdParamsSchema = z.object({
  id: z.string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid question ID format")
});
export const sendQuestionSchema = z.object({
  body:z.string()
  .min(1, "Question Body must be at least 1 characters")
  .max(500, "Question Body cannot exceed 500 characters")
})