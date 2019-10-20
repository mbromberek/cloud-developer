
import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { JwtToken } from '../../auth/JwtToken'

const cert = `-----BEGIN CERTIFICATE-----
MIIDBzCCAe+gAwIBAgIJCBdflncTlbUOMA0GCSqGSIb3DQEBCwUAMCExHzAdBgNV
BAMTFmRldi01LTg1emdzZy5hdXRoMC5jb20wHhcNMTkxMDE4MjM1MTU3WhcNMzMw
NjI2MjM1MTU3WjAhMR8wHQYDVQQDExZkZXYtNS04NXpnc2cuYXV0aDAuY29tMIIB
IjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvtp+AMxJauq4iLCkCQpsheKX
RKGUolam1qLX4YXqpGWuSZxtj85DDCLmTUDFgYQtGAq/Nxdm5ICPBWGUH5UDevQv
+xilajlAD2nY+OTZCvbz3vnHw0Nl9C0hWqit+He6NBrZQiG2yloanKa1A9I3jtEl
nAuWFxtVVjJMvrCLpxsNKd1zcIKcMUORZwWxtJB1qgWL9NX7kuiZmfRTwpexHa3C
ggKxWJrpjTNhBoiC/QNVBotkl7MUxPnosZpJRhiwYbfmGHx/Yo/hWCtmKVE2TLSj
SPhNGdbC88I1qJc1WG2OReohOZm+z3Yvr1RnnPKHBLizi+RuxK8vAw6DrvaD2QID
AQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBSxGrCKgKgFRbaGthpO
X5zu+FU2rDAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEBAE3zz2Ru
R4nii6rscEwbUuhesDHQX8Iu/qc21GChaMkwnJUO/BwNQ4WT5qORtoNj4eYAd81i
bNOFrgWw3SCwey+M6NfyV2RX70kRRm+f19eHpwNoY/8HR/6J2y6sOdTy1vDRgS0r
gfd1BKSpoC6h0bovYarSxB0lY+0RcVNTl3VcDkvX09Jl/wGIiGxO/Fd47CUBT/ZW
r/l0aytqqjJQEKNthtKmOLxvtsNUeO12seJ6ikyrnE32PCqfPuE0RhZbGrQtR7SH
0KB0h9m6iB1GpKdvPRC9x3tRHGXiOTM2M2uPKyU/f4STp3jBuEdvFNNlYa131Cs7
VQEXXbpO8Lu1+qY=
-----END CERTIFICATE-----`

export const handler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  try {
    const jwtToken = verifyToken(event.authorizationToken)
    console.log('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    console.log('User authorized', e.message)

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

function verifyToken(authHeader: string): JwtToken {
  if (!authHeader)
    throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return verify(token, cert, { algorithms: ['RS256'] }) as JwtToken
}
