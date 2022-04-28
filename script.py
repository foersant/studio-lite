import subprocess
import argparse

parser = argparse.ArgumentParser(description='This script is used to run or teardown the studio-lite application. Provide exactly one argument.')
parser.add_argument('start', nargs='?', help='This command will run: docker-compose up')
parser.add_argument('stop', nargs='?', help='This command will run: docker-compose stop')
parser.add_argument('down', nargs='?', help='This command will run: docker-compose down')
parser.add_argument('status', nargs='?', help='This command will run: docker ps')
parser.add_argument('logs', nargs='?', help='This command will run: docker-compose logs -f')
parser.add_argument('clean', nargs='?', help='This command will run: docker-compose down -v --remove-orphans')
parser.add_argument('build', nargs='?', help='This command will run: docker-compose build')
args = parser.parse_args()
command = args.start or args.stop or args.down or args.status or args.logs or args.clean or args.build

if command == None:
    print('Please provide exactly one argument. Use --help to know which argument you need.')
elif command == 'start':
    process = subprocess.run(['docker-compose', 'up'])

elif command == 'stop':
    process = subprocess.run(['docker-compose', 'stop'])

elif command == 'down':
    process = subprocess.run(['docker-compose', 'down'])

elif command == 'status':
    process = subprocess.run(['docker', 'ps'])

elif command == 'logs':
    process = subprocess.run(['docker-compose', 'logs', '-f'])

elif command == 'clean':
    process = subprocess.run(['docker-compose', 'down', '-v', '--remove-orphans'])

elif command == 'build':
    process = subprocess.run(['docker-compose', 'build'])