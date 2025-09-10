import { FastifyRequest, FastifyReply } from 'fastify';
import { extractTokenFromRequest, verifyAccessToken, JWTPayload } from '../lib/auth';

export interface AuthenticatedRequest extends FastifyRequest {
  user: JWTPayload;
}

// Authentication middleware
export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    const token = extractTokenFromRequest(request);
    
    if (!token) {
      return reply.status(401).send({ error: 'Access token required' });
    }

    const payload = verifyAccessToken(token);
    (request as AuthenticatedRequest).user = payload;
    
  } catch (error) {
    return reply.status(401).send({ error: 'Invalid or expired token' });
  }
}

// Role-based access control middleware
export function requireRole(roles: string[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (request as AuthenticatedRequest).user;
      
      if (!roles.includes(user.role)) {
        return reply.status(403).send({ 
          error: 'Insufficient permissions',
          required: roles,
          current: user.role
        });
      }
    } catch (error) {
      return reply.status(401).send({ error: 'Authentication required' });
    }
  };
}

// Permission-based access control middleware
export function requirePermission(permission: string) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (request as AuthenticatedRequest).user;
      
      // For now, we'll use role-based permissions
      // In a more complex system, you'd check against a permissions table
      const rolePermissions: Record<string, string[]> = {
        admin: ['*'], // Admin has all permissions
        moderator: ['missions:read', 'missions:write', 'submissions:read', 'submissions:review'],
        user: ['missions:read', 'missions:write', 'submissions:read', 'submissions:write'],
        reviewer: ['submissions:read', 'submissions:review']
      };

      const userPermissions = rolePermissions[user.role] || [];
      
      if (!userPermissions.includes('*') && !userPermissions.includes(permission)) {
        return reply.status(403).send({ 
          error: 'Insufficient permissions',
          required: permission,
          current: userPermissions
        });
      }
    } catch (error) {
      return reply.status(401).send({ error: 'Authentication required' });
    }
  };
}


