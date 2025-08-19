export default {
  '400': {
    BAD_REQUEST: {
      code: 'BAD_REQUEST',
      message: 'Something went wrong',
    },
    UNKNOWN_ERROR: {
      code: 'UNKNOWN_ERROR',
    },
  },
  '404': {
    EMPTY_PARAMETER: {
      code: 'EMPTY_PARAMETER',
      message: 'The required parameter cannot be empty: {param}.',
    },
    FIELD_REQUIRED_NOT_FOUND: {
      code: 'FIELD_REQUIRED_NOT_FOUND',
    },
    USER_NOT_FOUND: {
      code: 'USER_NOT_FOUND',
      message: 'This user are not in that group.',
    },
    FILTER_PARTICIPANT_INVALID: {
      code: 'FILTER_PARTICIPANT_INVALID',
      message: 'Only allowed participant filter: {filter}',
    },
  },
  '401': {
    UNAUTHORIZED_ACCESS: {
      code: 'UNAUTHORIZED_ACCESS',
      message: 'Invalid password.',
    },
    ACCESS_DENIED: {
      code: 'ACCESS_DENIED',
      message: 'Access Denied.',
    },
  },
  '429': {
    TOO_MANY_REQUEST: {
      code: 'TOO_MANY_REQUEST',
      message: 'Too many request, retry after {duration} seconds.',
    },
  },
  '403': {
    FORBIDDEN_RESOLVE: {
      code: 'FORBIDDEN_RESOLVE',
      message: 'What are you doing?',
    },
  },
};
