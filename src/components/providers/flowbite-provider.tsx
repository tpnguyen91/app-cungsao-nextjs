'use client';

import { Flowbite } from 'flowbite-react';
import type { CustomFlowbiteTheme } from 'flowbite-react';

const customTheme: CustomFlowbiteTheme = {
  button: {
    color: {
      primary:
        'bg-blue-600 hover:bg-blue-700 focus:ring-blue-300 text-white border border-transparent',
      secondary:
        'bg-gray-500 hover:bg-gray-600 focus:ring-gray-300 text-white border border-transparent',
      success:
        'bg-green-600 hover:bg-green-700 focus:ring-green-300 text-white border border-transparent',
      danger:
        'bg-red-600 hover:bg-red-700 focus:ring-red-300 text-white border border-transparent',
      warning:
        'bg-yellow-400 hover:bg-yellow-500 focus:ring-yellow-300 text-gray-900 border border-transparent',
      info: 'bg-cyan-600 hover:bg-cyan-700 focus:ring-cyan-300 text-white border border-transparent',
      light:
        'bg-gray-200 hover:bg-gray-300 focus:ring-gray-300 text-gray-900 border border-gray-200'
    },
    outline: {
      color: {
        primary:
          'border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white focus:ring-blue-300',
        secondary:
          'border border-gray-500 text-gray-500 hover:bg-gray-500 hover:text-white focus:ring-gray-300',
        success:
          'border border-green-600 text-green-600 hover:bg-green-600 hover:text-white focus:ring-green-300',
        danger:
          'border border-red-600 text-red-600 hover:bg-red-600 hover:text-white focus:ring-red-300'
      }
    }
  },
  card: {
    root: {
      base: 'flex rounded-lg border border-gray-100 bg-white shadow-sm',
      children: 'flex h-full flex-col justify-center gap-4 p-6',
      horizontal: {
        off: 'flex-col',
        on: 'flex-col md:max-w-xl md:flex-row'
      },
      href: 'hover:bg-gray-50 transition-colors duration-200'
    }
  },
  navbar: {
    root: {
      base: 'bg-white border-b border-gray-100 px-4 py-3',
      rounded: {
        on: 'rounded-lg',
        off: ''
      },
      bordered: {
        on: 'border',
        off: ''
      }
      // inner: 'mx-auto flex flex-wrap items-center justify-between',
    },
    brand: {
      base: 'flex items-center'
    },
    collapse: {
      base: 'w-full md:block md:w-auto',
      list: 'mt-4 flex flex-col p-4 md:mt-0 md:flex-row md:space-x-8 md:text-sm md:font-medium',
      hidden: {
        on: 'hidden',
        off: ''
      }
    },
    link: {
      base: 'block py-2 pl-3 pr-4 md:p-0 rounded transition-colors duration-200',
      active: {
        on: 'bg-blue-100 text-blue-700 md:bg-transparent md:text-blue-700 font-medium',
        off: 'text-gray-700 hover:bg-gray-100 md:border-0 md:hover:bg-transparent md:hover:text-blue-700'
      },
      disabled: {
        on: 'text-gray-400 hover:cursor-not-allowed',
        off: ''
      }
    }
  },
  sidebar: {
    root: {
      base: 'h-full',
      collapsed: {
        on: 'w-16',
        off: 'w-64'
      },
      inner:
        'h-full overflow-y-auto overflow-x-hidden bg-white border-r border-gray-100 px-3 py-4'
    },
    collapse: {
      button:
        'group flex w-full items-center rounded-lg p-2 text-base font-normal text-gray-900 transition duration-200 hover:bg-gray-100',
      icon: {
        base: 'h-6 w-6 text-gray-500 transition duration-200 group-hover:text-gray-900',
        open: {
          off: '',
          on: 'text-gray-900'
        }
      },
      label: {
        base: 'ml-3 flex-1 whitespace-nowrap text-left',
        icon: {
          base: 'h-6 w-6 transition ease-in-out duration-200',
          open: {
            on: 'rotate-180',
            off: ''
          }
        }
      },
      list: 'space-y-2 py-2'
    },
    item: {
      base: 'flex items-center rounded-lg p-3 text-base font-normal text-gray-900 hover:bg-gray-100 transition-colors duration-200',
      active: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
      collapsed: {
        insideCollapse: 'group ml-8 w-full pl-8 transition duration-200',
        noIcon: 'font-medium'
      },
      content: {
        base: 'flex-1 whitespace-nowrap'
      },
      icon: {
        base: 'h-5 w-5 flex-shrink-0 text-gray-500 transition duration-200 group-hover:text-gray-900',
        active: 'text-blue-600'
      },
      label: 'ml-3 flex-1 whitespace-nowrap',
      listItem: ''
    }
    // items: 'space-y-1 font-medium',
    // itemGroup: 'mt-4 space-y-2 border-t border-gray-100 pt-4 first:mt-0 first:border-t-0 first:pt-0',
  },
  table: {
    root: {
      base: 'w-full text-left text-sm text-gray-500',
      shadow:
        'absolute bg-white w-full h-full top-0 left-0 rounded-lg drop-shadow-md -z-10',
      wrapper: 'relative'
    },
    body: {
      base: 'group/body',
      cell: {
        base: 'px-6 py-4 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg'
      }
    },
    head: {
      base: 'group/head text-xs uppercase text-gray-700 bg-gray-50',
      cell: {
        base: 'px-6 py-3 group-first/head:first:rounded-tl-lg group-first/head:last:rounded-tr-lg bg-gray-50'
      }
    },
    row: {
      base: 'group/row bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200',
      hovered: 'hover:bg-gray-50',
      striped: 'odd:bg-white even:bg-gray-50'
    }
  },
  modal: {
    root: {
      base: 'fixed top-0 right-0 left-0 z-50 h-screen overflow-y-auto overflow-x-hidden md:inset-0 md:h-full',
      show: {
        on: 'flex bg-gray-900 bg-opacity-50',
        off: 'hidden'
      },
      sizes: {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        '2xl': 'max-w-7xl',
        '3xl': 'max-w-screen-xl',
        '4xl': 'max-w-screen-2xl',
        '5xl': 'max-w-screen-3xl',
        '6xl': 'max-w-screen-4xl',
        '7xl': 'max-w-screen-5xl'
      }
    },
    content: {
      base: 'relative h-full w-full p-4 md:h-auto',
      inner: 'relative rounded-lg bg-white shadow flex flex-col max-h-[90vh]'
    },
    body: {
      base: 'p-6 flex-1 overflow-y-auto',
      popup: 'pt-0'
    },
    header: {
      base: 'flex items-start justify-between rounded-t border-b border-gray-100 p-5',
      popup: 'p-2 border-b-0',
      title: 'text-xl font-semibold text-gray-900',
      close: {
        base: 'ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900',
        icon: 'h-5 w-5'
      }
    },
    footer: {
      base: 'flex items-center space-x-2 rounded-b border-t border-gray-100 p-6',
      popup: 'border-t-0'
    }
  },
  textInput: {
    base: 'flex',
    addon:
      'inline-flex items-center rounded-l-md border border-r-0 border-gray-200 bg-gray-200 px-3 text-sm text-gray-900',
    field: {
      base: 'relative w-full',
      icon: {
        base: 'pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3',
        svg: 'h-5 w-5 text-gray-500'
      },
      rightIcon: {
        base: 'pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3',
        svg: 'h-5 w-5 text-gray-500'
      },
      input: {
        base: 'block w-full border border-gray-200 bg-white p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50',
        sizes: {
          sm: 'p-2 sm:text-xs',
          md: 'p-2.5 text-sm',
          lg: 'sm:text-md p-4'
        },
        colors: {
          gray: 'bg-white border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-blue-500',
          info: 'border-cyan-500 bg-cyan-50 text-cyan-900 placeholder-cyan-700 focus:border-cyan-500 focus:ring-cyan-500',
          failure:
            'border-red-500 bg-red-50 text-red-900 placeholder-red-700 focus:border-red-500 focus:ring-red-500',
          warning:
            'border-yellow-500 bg-yellow-50 text-yellow-900 placeholder-yellow-700 focus:border-yellow-500 focus:ring-yellow-500',
          success:
            'border-green-500 bg-green-50 text-green-900 placeholder-green-700 focus:border-green-500 focus:ring-green-500'
        },
        withRightIcon: {
          on: 'pr-10',
          off: ''
        },
        withIcon: {
          on: 'pl-10',
          off: ''
        },
        withAddon: {
          on: 'rounded-r-lg',
          off: 'rounded-lg'
        },
        withShadow: {
          on: 'shadow-sm',
          off: ''
        }
      }
    }
  },
  select: {
    base: 'flex',
    addon:
      'inline-flex items-center rounded-l-md border border-r-0 border-gray-200 bg-gray-200 px-3 text-sm text-gray-900',
    field: {
      base: 'relative w-full',
      icon: {
        base: 'pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3',
        svg: 'h-5 w-5 text-gray-500'
      },
      select: {
        base: 'block w-full border border-gray-200 bg-white p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50',
        sizes: {
          sm: 'p-2 sm:text-xs',
          md: 'p-2.5 text-sm',
          lg: 'sm:text-md p-4'
        },
        colors: {
          gray: 'bg-white border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-blue-500',
          info: 'border-cyan-500 bg-cyan-50 text-cyan-900 focus:border-cyan-500 focus:ring-cyan-500',
          failure:
            'border-red-500 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-500',
          warning:
            'border-yellow-500 bg-yellow-50 text-yellow-900 focus:border-yellow-500 focus:ring-yellow-500',
          success:
            'border-green-500 bg-green-50 text-green-900 focus:border-green-500 focus:ring-green-500'
        },
        withIcon: {
          on: 'pl-10',
          off: ''
        },
        withAddon: {
          on: 'rounded-r-lg',
          off: 'rounded-lg'
        },
        withShadow: {
          on: 'shadow-sm',
          off: ''
        }
      }
    }
  },
  textarea: {
    base: 'block w-full rounded-lg border border-gray-200 bg-white p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50',
    colors: {
      gray: 'bg-white border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-blue-500',
      info: 'border-cyan-500 bg-cyan-50 text-cyan-900 placeholder-cyan-700 focus:border-cyan-500 focus:ring-cyan-500',
      failure:
        'border-red-500 bg-red-50 text-red-900 placeholder-red-700 focus:border-red-500 focus:ring-red-500',
      warning:
        'border-yellow-500 bg-yellow-50 text-yellow-900 placeholder-yellow-700 focus:border-yellow-500 focus:ring-yellow-500',
      success:
        'border-green-500 bg-green-50 text-green-900 placeholder-green-700 focus:border-green-500 focus:ring-green-500'
    },
    withShadow: {
      on: 'shadow-sm',
      off: ''
    }
  },
  label: {
    root: {
      base: 'text-sm font-medium',
      disabled: 'opacity-50',
      colors: {
        default: 'text-gray-900',
        info: 'text-cyan-500',
        failure: 'text-red-700',
        warning: 'text-yellow-500',
        success: 'text-green-700'
      }
    }
  },
  badge: {
    root: {
      base: 'flex h-fit items-center gap-1 font-semibold',
      color: {
        info: 'bg-cyan-100 text-cyan-800',
        gray: 'bg-gray-100 text-gray-800',
        failure: 'bg-red-100 text-red-800',
        success: 'bg-green-100 text-green-800',
        warning: 'bg-yellow-100 text-yellow-800',
        indigo: 'bg-indigo-100 text-indigo-800',
        purple: 'bg-purple-100 text-purple-800',
        pink: 'bg-pink-100 text-pink-800',
        blue: 'bg-blue-100 text-blue-800'
      },
      href: 'group',
      size: {
        xs: 'p-1 text-xs',
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-sm',
        lg: 'px-3 py-1 text-sm',
        xl: 'px-3 py-1.5 text-base'
      }
    },
    icon: {
      off: 'rounded-full',
      on: 'rounded-full p-1',
      size: {
        xs: 'h-3 w-3',
        sm: 'h-3.5 w-3.5',
        md: 'h-4 w-4',
        lg: 'h-4 w-4',
        xl: 'h-5 w-5'
      }
    }
  },
  alert: {
    base: 'flex flex-col gap-2 p-4 text-sm rounded-lg',
    borderAccent: 'border-t-4',
    closeButton: {
      base: '-mx-1.5 -my-1.5 ml-auto inline-flex h-8 w-8 rounded-lg p-1.5 focus:ring-2',
      icon: 'w-5 h-5',
      color: {
        info: 'bg-cyan-100 text-cyan-500 hover:bg-cyan-200 focus:ring-cyan-400',
        gray: 'bg-gray-100 text-gray-500 hover:bg-gray-200 focus:ring-gray-400',
        failure: 'bg-red-100 text-red-500 hover:bg-red-200 focus:ring-red-400',
        success:
          'bg-green-100 text-green-500 hover:bg-green-200 focus:ring-green-400',
        warning:
          'bg-yellow-100 text-yellow-500 hover:bg-yellow-200 focus:ring-yellow-400'
      }
    },
    color: {
      info: 'text-cyan-800 bg-cyan-100 border-cyan-500',
      gray: 'text-gray-800 bg-gray-100 border-gray-500',
      failure: 'text-red-800 bg-red-100 border-red-500',
      success: 'text-green-800 bg-green-100 border-green-500',
      warning: 'text-yellow-800 bg-yellow-100 border-yellow-500'
    },
    icon: 'mr-3 inline h-5 w-5 flex-shrink-0',
    rounded: 'rounded-lg',
    wrapper: 'flex items-center'
  }
};

interface FlowbiteProviderProps {
  children: React.ReactNode;
}

export function FlowbiteProvider({ children }: FlowbiteProviderProps) {
  return <Flowbite theme={{ theme: customTheme }}>{children}</Flowbite>;
}
