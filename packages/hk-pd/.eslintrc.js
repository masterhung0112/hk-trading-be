require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
    extends: ['eslint-config-hk'],
    'rules': {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/naming-convention': [
            'error',
            {
              'selector': 'default',
              'format': ['camelCase']
            },
        
            {
              'selector': 'variable',
              'format': ['camelCase', 'UPPER_CASE']
            },
            {
              'selector': 'parameter',
              'format': ['camelCase'],
              'leadingUnderscore': 'allow'
            },
        
            {
              'selector': 'memberLike',
              'modifiers': ['private'],
              'format': ['camelCase'],
              'leadingUnderscore': 'require'
            },
        
            {
              'selector': 'typeLike',
              'format': ['PascalCase']
            },
            {
              'selector': 'enumMember',
              'format': ['PascalCase']
            }
          ],
        '@typescript-eslint/ban-types': 0,
        '@typescript-eslint/no-this-alias': 0,
    }
}